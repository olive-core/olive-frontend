import assert from "node:assert/strict";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DeveloperPass from "@/components/try-olive/developer-pass";
import TryOlivePage from "@/components/try-olive/try-olive-page";
import DemoEditor, { DemoDoctorInfo, DemoPatientInfo } from "@/components/try-olive/demo-editor";
import { FullPrescriptionSkeleton } from "@/components/prescription/prescription-skeleton";
import { createPrescriptionStore, PrescriptionStoreContext } from "@/stores/prescription-store";
import { INITIAL_DEMO_PATIENT } from "@/lib/try-olive";

export async function run() {
    const store = createPrescriptionStore();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const root = createRoot(document.getElementById("root")!);
    const fetchBefore = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async (url, options) => {
        if (url === "/api/v1/try-olive/developer-pass" && options?.method === "POST") {
            assert.equal(JSON.parse(options.body as string).token, "private-invitation");
            return new Response(JSON.stringify({ active: true, expires_at: Date.now() / 1000 + 90 * 86400 }));
        }
        if (url === "/api/v1/try-olive/developer-pass") return new Response(JSON.stringify({ active: false }));
        requests++; throw new Error("No account requests allowed");
    };
    const wrap = (child: React.ReactNode) => <QueryClientProvider client={client}><PrescriptionStoreContext value={store}>{child}</PrescriptionStoreContext></QueryClientProvider>;
    const click = async (text: string) => {
        const button = [...document.querySelectorAll("button")].find(b => b.textContent?.trim() === text);
        assert.ok(button, `Button exists: ${text}`);
        await act(async () => { button.click(); });
    };
    try {
        window.history.replaceState({}, "", "/try#developer-pass=private-invitation");
        await act(async () => root.render(<DeveloperPass />));
        assert.equal(window.location.hash, "");
        await click("Activate on this browser");
        assert.ok(!document.body.textContent?.includes("Activate your developer pass"));
        console.log("PASS: private activation removes the URL token and confirms browser activation");
        await act(async () => root.render(wrap(<TryOlivePage />)));
        assert.ok(document.querySelector('[lang="bn"]')?.textContent?.includes("ডেঙ্গু"));
        const sample = document.querySelector('[aria-label="Sample conversation text"]')!;
        assert.ok(!sample.textContent?.includes(INITIAL_DEMO_PATIENT.name));
        assert.ok(!sample.textContent?.includes("বয়স"));
        for (const kind of ["medicine", "instruction", "investigation", "clinical"]) {
            assert.ok(sample.querySelector(`[data-highlight="${kind}"]`));
        }
        await click("English");
        assert.ok(document.querySelector('[lang="en"]')?.textContent?.includes("What brings you in today?"));
        assert.ok(!document.querySelector('[lang="en"]')?.textContent?.includes("years old"));
        console.log("PASS: optional bilingual sample highlights clinical details without patient identity");
        const sampleButton = [...document.querySelectorAll("button")].find(button => button.textContent?.includes("Need a case? Open the sample"));
        assert.ok(sampleButton);
        await act(async () => { sampleButton.click(); });
        const phoneDialog = document.querySelector('[role="dialog"]')!;
        assert.ok(phoneDialog.textContent?.includes("Read along & record"));
        assert.ok([...phoneDialog.querySelectorAll("button")].some(button => button.textContent?.includes("Start consultation")));
        assert.ok(phoneDialog.querySelector('[aria-label="Sample conversation text"]'));
        await click("Close");
        assert.equal(document.querySelector('[role="dialog"]'), null);
        console.log("PASS: phone read-along view keeps recording controls available and closes cleanly");
        store.getState().setGenerating(true);
        await act(async () => root.render(wrap(<FullPrescriptionSkeleton sessionId="" header={<DemoDoctorInfo />} patientStrip={<DemoPatientInfo patient={INITIAL_DEMO_PATIENT} />} onCancel={() => store.getState().setGenerating(false)} />)));
        assert.ok(document.body.textContent?.includes("Analyzing conversation"));
        assert.ok(document.body.textContent?.includes(INITIAL_DEMO_PATIENT.name));
        await click("Cancel");
        assert.equal(store.getState().isGenerating, false);
        await act(async () => root.render(wrap(<DemoEditor patient={INITIAL_DEMO_PATIENT} onGenerate={() => {}} onCancel={() => {}} />)));
        assert.ok(document.querySelector('[role="dialog"]')?.textContent?.includes("Edit your draft"));
        await click("Next");
        assert.ok(document.querySelector('[role="dialog"]')?.textContent?.includes("Dengue Fever"));
        assert.ok(document.querySelector('[role="dialog"]')?.textContent?.includes("your common cases"));
        await click("Back");
        assert.ok(document.querySelector('[role="dialog"]')?.textContent?.includes("Edit your draft"));
        await click("Next");
        await click("Next");
        assert.ok(document.querySelector('[role="dialog"]')?.textContent?.includes("Review clinical notes"));
        assert.ok(!document.querySelector('[role="dialog"]')?.textContent?.includes("Everything here stays"));
        await click("Back");
        await click("Skip guide");
        assert.equal(document.querySelector('[role="dialog"]'), null);
        const reference = document.querySelector("details")!;
        assert.equal(reference.open, false);
        await act(async () => { reference.querySelector("summary")!.click(); });
        assert.equal(reference.open, true);
        assert.ok(reference.querySelector('[data-highlight="medicine"]'));
        await act(async () => { reference.querySelector("summary")!.click(); });
        assert.equal(reference.open, false);
        console.log("PASS: guide supports Back/Next and highlighted sample can be reopened from results");
        await click("Apply memory");
        await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
        const memory = [...document.querySelectorAll('[cmdk-item]')].find(el => el.textContent?.includes("Dengue Fever"));
        assert.ok(memory);
        await act(async () => { (memory as HTMLElement).click(); await new Promise(resolve => setTimeout(resolve, 30)); });
        assert.equal(store.getState().medicine.length, 2);
        await click("Save & Print");
        assert.ok(document.querySelector('[role="dialog"]')?.textContent?.includes("Start saving your consultations"));
        assert.equal(requests, 0);
        console.log("PASS: anonymous shared loading/editor, skippable popup, Memory and registration gate render without account fetches");
    } finally {
        await act(async () => root.unmount());
        client.clear(); globalThis.fetch = fetchBefore;
    }
}
