// Bridges the recorder and the prescribe screen across navigation: the recorder
// registers the promise that resolves once every audio chunk has been uploaded,
// and the prescribe screen awaits it before generating the draft so the
// transcription is complete — including the final chunk.

const pendingFinalizations = new Map<string, Promise<void>>();

export function trackRecordingFinalization(sessionId: string, finalization: Promise<void>): void {
    pendingFinalizations.set(sessionId, finalization);
    // A completed upload no longer needs tracking. Keep a rejection until a waiter sees
    // it so generation cannot silently continue after a fast failed final upload.
    void finalization.then(
        () => clearTrackedFinalization(sessionId, finalization),
        () => undefined,
    );
}

function clearTrackedFinalization(sessionId: string, finalization: Promise<void>): void {
    if (pendingFinalizations.get(sessionId) === finalization) {
        pendingFinalizations.delete(sessionId);
    }
}

export class RecordingFinalizationTimeoutError extends Error {
    constructor(timeoutMs: number) {
        super(`Final recording upload did not finish within ${timeoutMs}ms`);
        this.name = 'RecordingFinalizationTimeoutError';
    }
}

type RecordingFinalizationWaitOptions = {
    timeoutMs?: number;
    signal?: AbortSignal;
};

function abortError(): Error {
    const error = new Error('Recording finalization wait was cancelled');
    error.name = 'AbortError';
    return error;
}

async function waitForFinalization(
    finalization: Promise<void>,
    { timeoutMs, signal }: RecordingFinalizationWaitOptions,
): Promise<void> {
    if (signal?.aborted) throw abortError();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let abortHandler: (() => void) | undefined;
    const terminalPromises: Promise<void>[] = [finalization];

    if (timeoutMs !== undefined) {
        terminalPromises.push(new Promise((_, reject) => {
            timeoutId = setTimeout(
                () => reject(new RecordingFinalizationTimeoutError(timeoutMs)),
                timeoutMs,
            );
        }));
    }

    if (signal) {
        terminalPromises.push(new Promise((_, reject) => {
            abortHandler = () => reject(abortError());
            signal.addEventListener('abort', abortHandler, { once: true });
        }));
    }

    try {
        await Promise.race(terminalPromises);
    } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
    }
}

function isWaitInterruption(error: unknown): boolean {
    return error instanceof RecordingFinalizationTimeoutError
        || (error instanceof Error && error.name === 'AbortError');
}

export async function awaitRecordingFinalization(
    sessionId: string,
    options: RecordingFinalizationWaitOptions = {},
): Promise<void> {
    const finalization = pendingFinalizations.get(sessionId);
    if (!finalization) return;

    try {
        await waitForFinalization(finalization, options);
        clearTrackedFinalization(sessionId, finalization);
    } catch (error) {
        // A timeout or cancellation should leave the upload available for the next retry.
        // A real upload failure is consumed once and then removed.
        if (!isWaitInterruption(error)) {
            clearTrackedFinalization(sessionId, finalization);
        }
        throw error;
    }
}
