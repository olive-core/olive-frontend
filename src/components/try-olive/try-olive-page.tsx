import "./try-olive-layout.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, CheckIcon, MicIcon, PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { createPrescriptionStore, PrescriptionStoreContext } from "@/stores/prescription-store";
import { useStableCallback } from "@/hooks/use-stable-callback";
import { useDemoRecorder } from "@/hooks/use-demo-recorder";
import { DEMO_MAX_SECONDS, generateDemo, INITIAL_DEMO_PATIENT, type DemoPatient } from "@/lib/try-olive";
import DemoEditor, { DemoDoctorInfo, DemoPatientInfo } from "./demo-editor";
import { FullPrescriptionSkeleton } from "@/components/prescription/prescription-skeleton";
import DeveloperPass from "./developer-pass";
import SampleConversation from "./sample-conversation";

export default function TryOlivePage() {
    const [store] = useState(createPrescriptionStore);
    const [patient, setPatient] = useState<DemoPatient>(INITIAL_DEMO_PATIENT);
    const [age, setAge] = useState(String(INITIAL_DEMO_PATIENT.age));
    const [stage, setStage] = useState<"record" | "processing" | "review">("record");
    const [error, setError] = useState<string | null>(null);
    const request = useRef<AbortController | null>(null);
    const recorder = useDemoRecorder();
    const active = recorder.status !== "idle";
    const valid = patient.name.trim().length > 0 && /^\d+$/.test(age) && Number(age) <= 120;

    useEffect(() => () => request.current?.abort(), []);
    useEffect(() => {
        if (!active && stage === "record") return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [active, stage]);

    const process = useStableCallback(async () => {
        if (!recorder.audio || request.current) return;
        const controller = new AbortController(); request.current = controller;
        setStage("processing"); setError(null);
        store.getState().resetStore(); store.getState().setGenerating(true);
        window.scrollTo({ top: 0 });
        try {
            const result = await generateDemo(recorder.audio, patient, controller.signal, {
                onPartial: data => store.getState().setPartialData(data),
                onScribe: data => store.getState().applyScribeData(data),
                onDecide: data => store.getState().applyDecideData(data),
            });
            if (controller.signal.aborted) return;
            await store.getState().getInitialPrescription(result);
            store.getState().setGenerating(false); setStage("review");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (cause) {
            if (controller.signal.aborted) return;
            setError(cause instanceof Error ? cause.message : "Processing failed. Please try again.");
            store.getState().setGenerating(false); setStage("record");
        } finally { if (request.current === controller) request.current = null; }
    });

    const attemptedAudio = useRef<Blob | null>(null);
    useEffect(() => {
        if (recorder.status === "ready" && recorder.audio && attemptedAudio.current !== recorder.audio) {
            attemptedAudio.current = recorder.audio;
            void process();
        }
    }, [recorder.status, recorder.audio, process]);

    const restart = () => {
        request.current?.abort(); request.current = null;
        recorder.reset(); store.getState().resetStore(); setStage("record"); setError(null);
    };

    const cancel = () => {
        request.current?.abort(); request.current = null;
        store.getState().setGenerating(false); setStage("review");
    };

    const recordingButtons = (
                            <div className="flex flex-wrap justify-center gap-2">
                                {recorder.status === "idle" && <Button className="h-11 w-full" disabled={!valid} onClick={() => void recorder.start()}><MicIcon /> Start consultation</Button>}
                                {recorder.status === "recording" && <Button variant="outline" onClick={recorder.pause}><PauseIcon /> Pause</Button>}
                                {recorder.status === "paused" && <Button variant="outline" onClick={recorder.resume}><PlayIcon /> Resume</Button>}
                                {["recording", "paused"].includes(recorder.status) && <Button onClick={recorder.finish}><SquareIcon /> Finish &amp; prescribe</Button>}
                                {recorder.status === "ready" && <Button className="h-11 w-full" onClick={() => void process()}>Generate prescription &amp; notes</Button>}
                                {active && <Button variant="ghost" onClick={recorder.reset}>Discard recording</Button>}
                            </div>
    );
    const phoneRecorder = <div className="space-y-2">
        <p className="text-center text-sm tabular-nums" role="status">{Math.floor(recorder.seconds / 60)}:{String(recorder.seconds % 60).padStart(2, "0")} / {DEMO_MAX_SECONDS / 60}:00 · {recorder.status === "idle" ? "Ready to record" : recorder.status}</p>
        {recordingButtons}
        {(error || recorder.error) && <p role="alert" className="text-sm text-rose-700">{error || recorder.error}</p>}
    </div>;

    if (stage !== "record") return <PrescriptionStoreContext value={store}>
        <div className="doctor-portal min-h-svh bg-white print:hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <Link to="/" className="text-emerald-700 font-semibold">Olive</Link>
                <span className="text-xs text-slate-500">Fictional practice · Not saved</span>
                <Button variant="ghost" size="sm" onClick={restart}>Start another practice session</Button>
            </header>
            {stage === "processing"
                ? <FullPrescriptionSkeleton sessionId="" header={<DemoDoctorInfo />} patientStrip={<DemoPatientInfo patient={patient} />} onCancel={cancel} />
                : <DemoEditor patient={patient} onGenerate={() => void process()} onCancel={cancel} />}
        </div>
        <p className="hidden print:block">This is an unsaved fictional Olive demo. Register to start saving consultations.</p>
    </PrescriptionStoreContext>;

    return <PrescriptionStoreContext value={store}>
        <div className="try-recorder-page min-h-svh bg-gradient-to-b from-emerald-50/60 via-white to-white print:hidden">
            <header className="border-b border-emerald-100 bg-white/90">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
                    <Link to="/" className="flex items-center gap-2 text-sm text-slate-600"><ArrowLeftIcon className="size-4" /> Olive</Link>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Try Olive · No account needed</span>
                </div>
            </header>
            <main className="try-recorder-main mx-auto w-full max-w-6xl px-3 py-3 sm:px-4">
                <DeveloperPass />
                <div className="try-recorder-heading mb-3">
                    <h1 className="font-display text-xl sm:text-2xl">Try a fictional consultation</h1>
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950"><strong>This practice session is not saved.</strong> Refreshing or leaving this page clears it.</p>
                </div>
                <div className="try-recorder-grid grid min-w-0 gap-3 md:h-[calc(100dvh-10rem)] md:min-h-[30rem] md:max-h-[48rem] md:grid-cols-2 md:grid-rows-[auto_minmax(0,1fr)]">
                    <Item variant="outline" className="try-patient-card min-w-0 bg-white p-3 sm:p-4">
                        <ItemContent className="gap-3">
                            <div><ItemTitle className="text-base">Your practice patient</ItemTitle><ItemDescription className="try-patient-description">Fictional patient · Edit before recording.</ItemDescription></div>
                            <fieldset disabled={active} className="grid grid-cols-2 gap-2">
                                <label className="col-span-2 text-sm font-medium" htmlFor="demo-name">Name<Input id="demo-name" className="mt-1" value={patient.name} maxLength={80} onChange={(e) => setPatient({ ...patient, name: e.target.value })} /></label>
                                <label className="text-sm font-medium" htmlFor="demo-age">Age<Input id="demo-age" className="mt-1" type="number" min={0} max={120} value={age} onChange={(e) => { setAge(e.target.value); setPatient({ ...patient, age: Number(e.target.value) }); }} /></label>
                                <label className="text-sm font-medium" htmlFor="demo-sex">Sex<select id="demo-sex" className="mt-1 h-11 w-full rounded-md border bg-white px-2 text-base sm:text-sm" value={patient.sex} onChange={(e) => setPatient({ ...patient, sex: e.target.value as DemoPatient["sex"] })}><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Others</option></select></label>
                            </fieldset>
                        </ItemContent>
                    </Item>
                    <div className="try-recorder-card flex min-w-0 flex-col justify-center rounded-2xl border bg-white p-3 text-center shadow-sm md:col-start-1 md:row-start-2 md:overflow-y-auto sm:p-4">
                        <>
                            <div className="mx-auto mb-2 hidden size-10 md:flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700">{recorder.status === "ready" ? <CheckIcon /> : <MicIcon className={recorder.status === "recording" ? "animate-pulse" : ""} />}</div>
                            <p className="text-3xl tabular-nums">{Math.floor(recorder.seconds / 60)}:{String(recorder.seconds % 60).padStart(2, "0")} <span className="text-sm text-slate-400">/ {DEMO_MAX_SECONDS / 60}:00</span></p>
                            <p role="status" className="my-2 text-xs leading-relaxed text-slate-600">{recorder.status === "recording" ? "Listening to your fictional consultation" : recorder.status === "paused" ? "Recording paused" : recorder.status === "ready" ? "Recording ready. Let Arise take it from here." : recorder.status === "preparing" ? "Preparing your recording…" : recorder.status === "starting" ? "Getting ready — allow microphone access when asked" : "Use a fictional case for this practice session."}</p>
                            {recordingButtons}
                        </>
                        {(error || recorder.error) && <div role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error || recorder.error}</div>}
                    </div>
                    <SampleConversation recorderControls={phoneRecorder} />
                </div>
            </main>
        </div>
        <p className="hidden print:block">This is an unsaved fictional Olive demo. Register to start saving consultations.</p>
    </PrescriptionStoreContext>;
}
