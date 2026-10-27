import type { PrescriptionResponseType } from "@/types/prescription";
import { readEventStream, type AriseStreamHandlers } from "@/lib/arise-stream";

export const DEMO_MAX_SECONDS = 180;
export const DEMO_SAMPLE_RATE = 16000;
export type DemoPatient = { name: string; age: number; sex: "male" | "female" | "non_binary" };
export const INITIAL_DEMO_PATIENT: DemoPatient = { name: "Samira Rahman", age: 32, sex: "female" };

async function checked(response: Response): Promise<Response> {
    if (response.ok) return response;
    if (response.status === 404) {
        throw new Error("Try Olive is temporarily unavailable. Please try again shortly. No account is needed to try it.");
    }
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : "Something went wrong. Please try again.");
}

export async function startDemo(): Promise<void> {
    await checked(await fetch("/api/v1/try-olive/start", { method: "POST", credentials: "same-origin" }));
}

export async function generateDemo(audio: Blob, patient: DemoPatient, signal: AbortSignal, handlers?: Omit<AriseStreamHandlers, "onCompleted">): Promise<PrescriptionResponseType> {
    const response = await checked(await fetch("/api/v1/try-olive/generate", {
        method: "POST", credentials: "same-origin", headers: {
            "Content-Type": "audio/wav", "Accept": "text/event-stream",
            "X-Demo-Age": String(patient.age), "X-Demo-Sex": patient.sex,
        }, body: audio, signal,
    }));
    if (!response.body) throw new Error("The connection closed. Please try again.");
    let draft: PrescriptionResponseType | undefined;
    const outcome = await readEventStream(response.body, {
        onPartial: handlers?.onPartial ?? (() => {}), onScribe: handlers?.onScribe ?? (() => {}), onDecide: handlers?.onDecide ?? (() => {}),
        onCompleted: (result) => { draft = result; },
    }, signal);
    if (outcome.status === "failed") throw new Error(outcome.reason);
    if (!draft) throw new Error("No draft arrived. Please try again.");
    return draft;
}

// Convert browser-specific MediaRecorder output into a bounded PCM WAV entirely
// in memory. No IndexedDB, localStorage, object uploads or clinical record IDs.
export async function recordingToWav(recording: Blob): Promise<Blob> {
    const decoder = new OfflineAudioContext(1, 1, DEMO_SAMPLE_RATE);
    const decoded = await decoder.decodeAudioData(await recording.arrayBuffer());
    const frames = Math.min(Math.ceil(decoded.duration * DEMO_SAMPLE_RATE), DEMO_MAX_SECONDS * DEMO_SAMPLE_RATE);
    if (frames < DEMO_SAMPLE_RATE) throw new Error("Record at least a second of conversation before finishing.");
    const renderer = new OfflineAudioContext(1, frames, DEMO_SAMPLE_RATE);
    const source = renderer.createBufferSource();
    source.buffer = decoded;
    source.connect(renderer.destination);
    source.start();
    const rendered = await renderer.startRendering();
    return new Blob([encodePcmWav(rendered.getChannelData(0))], { type: "audio/wav" });
}

export function encodePcmWav(samples: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const text = (offset: number, value: string) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
    text(0, "RIFF"); view.setUint32(4, buffer.byteLength - 8, true); text(8, "WAVE");
    text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, DEMO_SAMPLE_RATE, true); view.setUint32(28, DEMO_SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, "data"); view.setUint32(40, samples.length * 2, true);
    samples.forEach((sample, i) => {
        const bounded = Math.max(-1, Math.min(1, sample));
        view.setInt16(44 + i * 2, bounded * (bounded < 0 ? 32768 : 32767), true);
    });
    return buffer;
}
