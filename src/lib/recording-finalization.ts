// Bridges the recorder and the prescribe screen across navigation: the recorder
// registers the promise that resolves once every audio chunk has been uploaded,
// and the prescribe screen awaits it before generating the draft so the
// transcription is complete — including the final chunk.

const pendingFinalizations = new Map<string, Promise<void>>();

export function trackRecordingFinalization(sessionId: string, finalization: Promise<void>): void {
    pendingFinalizations.set(sessionId, finalization);
}

export async function awaitRecordingFinalization(sessionId: string): Promise<void> {
    const finalization = pendingFinalizations.get(sessionId);
    if (!finalization) return;
    try {
        await finalization;
    } finally {
        pendingFinalizations.delete(sessionId);
    }
}
