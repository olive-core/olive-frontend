import { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import RecordingSessionProvider from "@/components/dashboard/consultation/recording-session-provider";
import FloatingRecorder from "@/components/dashboard/consultation/floating-recorder";
import Recorder from "@/components/dashboard/consultation/recorder";
import { micState, setMicrophoneAvailable } from "./dom-setup";
import { apiCalls } from "./stubs/axios";
import { navigations, routeParams } from "./stubs/router";

const SESSION_ID = "session-1";
const PATIENT_ID = "patient-1";

type Page = "consultation" | "elsewhere";
let setPage: (page: Page) => void = () => {};

function DashboardHarness() {
    const [page, setPageState] = useState<Page>("consultation");
    setPage = setPageState;
    return (
        <RecordingSessionProvider>
            <div>
                {page === "consultation" ? <Recorder /> : <div>Some other dashboard page</div>}
                <FloatingRecorder />
            </div>
        </RecordingSessionProvider>
    );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const flush = async (ms = 0) => { await act(async () => { await wait(ms); }); };
const goTo = async (page: Page) => { await act(async () => { setPage(page); }); await flush(30); };
const click = async (element: Element | null | undefined) => {
    await act(async () => { (element as HTMLElement | null)?.click(); });
    await flush(30);
};

const root = () => document.getElementById("root")!;
const text = () => root().textContent ?? "";
const widget = () => document.querySelector('[aria-label="Recording in progress"]');
const button = (label: string) =>
    [...document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes(label));
const byAriaLabel = (label: string) => document.querySelector(`[aria-label="${label}"]`);
const chunkUploads = () => apiCalls.filter((c) => c.url.includes("/conversation/chunk")).length;

let failures = 0;
function check(label: string, passed: boolean, detail = "") {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : `   -> ${detail}`}`);
}
const section = (title: string) => console.log(`\n${title}`);

export async function runTest() {
    routeParams.userId = PATIENT_ID;
    routeParams.consultationId = SESSION_ID;

    const container = root();
    let reactRoot: Root;
    await act(async () => { reactRoot = createRoot(container); reactRoot.render(<DashboardHarness />); });
    await flush(60);

    section("1. Starting a consultation");
    check("microphone opened exactly once", micState.getUserMediaCalls === 1, `calls=${micState.getUserMediaCalls}`);
    check("exactly one MediaRecorder exists", micState.recorders.length === 1, `recorders=${micState.recorders.length}`);
    check("it is capturing", micState.recorders[0]?.state === "recording");
    check("the card is on screen", text().includes("Finish & Prescribe"));
    check("status reads Listening", text().toLowerCase().includes("listening"));

    section("2. The timer runs");
    await flush(1300);
    check("timer advanced past 00:00", /00:0[1-9]/.test(text()), `text=${text().slice(0, 90)}`);
    check("still only one recorder", micState.recorders.length === 1, `recorders=${micState.recorders.length}`);
    check("no chunks uploaded yet", chunkUploads() === 0, `uploads=${chunkUploads()}`);

    section("3. Navigating to another page");
    await goTo("elsewhere");
    check("floating widget is visible", widget() !== null);
    check("widget shows the running timer", /00:0[1-9]/.test(widget()?.textContent ?? ""), `widget=${widget()?.textContent}`);
    check("microphone still open", micState.liveTracks === 1, `liveTracks=${micState.liveTracks}`);
    check("no extra recorder was opened", micState.recorders.length === 1, `recorders=${micState.recorders.length}`);

    section("4. Pause and resume from the widget");
    await click(byAriaLabel("Pause recording"));
    check("capture paused", micState.recorders.every((r) => r.state !== "recording"));
    check("widget offers Resume", byAriaLabel("Resume recording") !== null);
    check("status reads Paused", (widget()?.textContent ?? "").toLowerCase().includes("paused"));
    await click(byAriaLabel("Resume recording"));
    check("capture resumed", micState.recorders.some((r) => r.state === "recording"));

    section("5. Returning to the consultation");
    await goTo("consultation");
    check("widget hides behind the card", widget() === null);
    check("card is back", text().includes("Finish & Prescribe"));
    check("no second microphone", micState.getUserMediaCalls === 1, `calls=${micState.getUserMediaCalls}`);
    check("no second recorder", micState.recorders.length === 1, `recorders=${micState.recorders.length}`);

    section("6. Repeated navigation never restarts capture");
    for (let i = 0; i < 6; i++) { await goTo("elsewhere"); await goTo("consultation"); }
    check("microphone still opened once", micState.getUserMediaCalls === 1, `calls=${micState.getUserMediaCalls}`);
    check("still exactly one recorder", micState.recorders.length === 1, `recorders=${micState.recorders.length}`);

    section("7. Finishing from the floating widget");
    await goTo("elsewhere");
    await click(button("Finish & Prescribe"));
    await flush(150);
    check("navigated to the prescribe screen", navigations.some((n) => n.to.includes("prescribe")), JSON.stringify(navigations));
    check("microphone released", micState.liveTracks === 0, `liveTracks=${micState.liveTracks}`);
    check("every recorder stopped", micState.recorders.every((r) => r.state === "inactive"));
    check("final chunk uploaded", chunkUploads() === 1, `uploads=${chunkUploads()}`);
    check("widget gone", widget() === null);

    section("8. Returning to a finished consultation");
    await goTo("consultation");
    check("shows the finished notice", text().includes("Recording finished"), `text=${text().slice(0, 120)}`);
    check("does not record again", micState.getUserMediaCalls === 1, `calls=${micState.getUserMediaCalls}`);
    await flush(400);
    check("no further chunk uploads", chunkUploads() === 1, `uploads=${chunkUploads()}`);

    await act(async () => { reactRoot.unmount(); });

    section("9. A blocked microphone is visible and recoverable");
    micState.reset();
    setMicrophoneAvailable(false);
    routeParams.consultationId = "session-2";
    const secondRoot = createRoot(container);
    await act(async () => { secondRoot.render(<DashboardHarness />); });
    await flush(80);
    check("says the microphone is blocked", text().toLowerCase().includes("microphone blocked"), `text=${text().slice(0, 140)}`);
    check("offers Try again", button("Try again") !== undefined);
    check("no runaway recorder", micState.recorders.length === 0, `recorders=${micState.recorders.length}`);
    await goTo("elsewhere");
    check("widget still reachable while blocked", widget() !== null);
    setMicrophoneAvailable(true);
    await click(button("Try again"));
    await flush(80);
    check("recovers and captures", micState.recorders.some((r) => r.state === "recording"));
    await flush(1200);
    check("timer runs after recovery", /00:0[1-9]/.test(text()), `text=${text().slice(0, 90)}`);

    section("10. Leaving the dashboard releases the microphone");
    const tracksBeforeLeaving = micState.liveTracks;
    await act(async () => { secondRoot.unmount(); });
    await flush(30);
    check("microphone was open before leaving", tracksBeforeLeaving === 1, `liveTracks=${tracksBeforeLeaving}`);
    check("microphone released on unmount", micState.liveTracks === 0, `liveTracks=${micState.liveTracks}`);
    check("no recorder left running", micState.recorders.every((r) => r.state === "inactive"));

    console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
    process.exitCode = failures === 0 ? 0 : 1;
}
