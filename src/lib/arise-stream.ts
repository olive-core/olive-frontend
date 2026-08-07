// Consumes the ARISE progressive-generation stream and reports how the run ended.
//
// Every run reaches a terminal outcome — there is no path that resolves without one. A
// failed run is retried in place, so a transient Gemini failure costs the doctor a few
// extra seconds of the same loading screen instead of a dead screen and a manual
// re-generate.
//
// A full prescription is meant to land within 30s, and a re-run has to fit inside that, so
// the deadline is the cutoff for *starting* one: a run that failed cheaply (a quota
// rejection, a dropped connection, the generation lock) is retried, while one that already
// spent the budget surfaces rather than doubling a wait the doctor is tired of.

import type { PrescriptionResponseType } from '@/types/prescription';
import { ARISE_STREAM_IDLE_TIMEOUT_MS } from '@/lib/arise-timeouts';

const GENERATE_ENDPOINT = '/api/v1/arise/generate-progressive';
const MAX_ATTEMPTS = 2;
const RETRY_DEADLINE_MS = 15_000;
const RETRY_DELAY_MS = 500;

export type ArisePartialPayload = Pick<
    PrescriptionResponseType,
    'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'diagnoses' | 'vitals' | 'follow_up'
>;

export type AriseScribePayload = Pick<
    PrescriptionResponseType,
    'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'vitals' | 'follow_up' | 'advice'
>;

export type AriseDecidePayload = Pick<
    PrescriptionResponseType,
    'diagnoses' | 'medicines' | 'investigations' | 'unresolved_mentions'
>;

export type AriseStreamHandlers = {
    onPartial: (payload: ArisePartialPayload) => void;
    onScribe: (payload: AriseScribePayload) => void;
    onDecide: (payload: AriseDecidePayload) => void;
    onCompleted: (payload: PrescriptionResponseType) => void;
};

export type AriseGenerationRequest = {
    sessionId: string;
    accessToken: string | null;
    signal: AbortSignal;
    handlers: AriseStreamHandlers;
};

// `failed` covers a server error event, a rejected request and a connection that drops
// mid-run. The caller cannot tell them apart and treats all three the same: try again.
export type AriseStreamOutcome =
    | { status: 'completed' }
    | { status: 'failed'; reason: string };

// The server sends each stage a subset of the final draft, so one shape covers every
// event; `error` events carry a reason in place of draft data.
type RawAriseEvent = {
    payload?: PrescriptionResponseType & { error?: string };
};

export async function generateAriseDraft(
    request: AriseGenerationRequest,
): Promise<AriseStreamOutcome> {
    const deadline = Date.now() + RETRY_DEADLINE_MS;
    let attempt = 1;

    while (true) {
        const outcome = await runGenerationAttempt(request);
        if (outcome.status === 'completed') return outcome;
        if (attempt >= MAX_ATTEMPTS || Date.now() >= deadline) return outcome;

        attempt++;
        console.warn(`[arise] ${outcome.reason} — retrying silently (attempt ${attempt}/${MAX_ATTEMPTS})`);
        await delay(RETRY_DELAY_MS, request.signal);
    }
}

async function runGenerationAttempt({
    sessionId,
    accessToken,
    signal,
    handlers,
}: AriseGenerationRequest): Promise<AriseStreamOutcome> {
    let response: Response;
    try {
        response = await fetch(GENERATE_ENDPOINT, {
            method: 'POST',
            headers: buildHeaders(accessToken),
            body: JSON.stringify({
                session_id: sessionId,
                dialogue: '',
                force_variant: 'one',
                persist_draft: true,
            }),
            signal,
        });
    } catch (error) {
        if (isAbort(error)) throw error;
        return { status: 'failed', reason: errorMessage(error) };
    }

    if (!response.ok || !response.body) {
        return { status: 'failed', reason: `Generation request was rejected (${response.status})` };
    }

    return readEventStream(response.body, handlers, signal);
}

function buildHeaders(accessToken: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    return headers;
}

async function readEventStream(
    body: ReadableStream<Uint8Array>,
    handlers: AriseStreamHandlers,
    signal: AbortSignal,
): Promise<AriseStreamOutcome> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventName = '';

    try {
        while (true) {
            let readResult: ReadableStreamReadResult<Uint8Array>;
            try {
                readResult = await readWithIdleTimeout(reader, signal);
            } catch (error) {
                if (isAbort(error)) throw error;
                return { status: 'failed', reason: errorMessage(error) };
            }

            const { done, value } = readResult;
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            // Keep the last (potentially incomplete) line in the buffer
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                if (line.startsWith('event:')) {
                    eventName = line.slice(6).trim();
                    continue;
                }
                if (!line.startsWith('data:')) continue;

                const outcome = applyEvent(eventName, line.slice(5).trim(), handlers);
                eventName = '';
                if (outcome) return outcome;
            }
        }
    } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
    }

    // The server closes the stream only after a `completed` or `error` event, so getting
    // here means the connection dropped part-way through.
    return { status: 'failed', reason: 'Generation stream ended before a result arrived' };
}

async function readWithIdleTimeout(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    signal: AbortSignal,
): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (signal.aborted) throw abortError();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let abortHandler: (() => void) | undefined;
    try {
        return await Promise.race([
            reader.read(),
            new Promise<never>((_, reject) => {
                timeoutId = setTimeout(
                    () => reject(new Error(
                        `Generation stream was inactive for ${ARISE_STREAM_IDLE_TIMEOUT_MS}ms`,
                    )),
                    ARISE_STREAM_IDLE_TIMEOUT_MS,
                );
            }),
            new Promise<never>((_, reject) => {
                abortHandler = () => reject(abortError());
                signal.addEventListener('abort', abortHandler, { once: true });
            }),
        ]);
    } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        if (abortHandler) signal.removeEventListener('abort', abortHandler);
    }
}

// Returns the run's outcome once a terminal event lands, and undefined for every event
// that only patches a section of the draft.
function applyEvent(
    eventName: string,
    rawData: string,
    handlers: AriseStreamHandlers,
): AriseStreamOutcome | undefined {
    const event = parseEvent(rawData);
    if (!event) return undefined;

    if (eventName === 'error') {
        return { status: 'failed', reason: event.payload?.error ?? 'Generation failed on the server' };
    }

    const payload = event.payload;
    if (!payload) return undefined;

    switch (eventName) {
        case 'stage01_complete': // v2_faster
        case 'layer00_complete': // v1_standard
            handlers.onPartial(payload);
            return undefined;

        // Arise One runs Scribe and Decide in parallel; each patches its own sections as
        // it lands, in whichever order the calls finish.
        case 'scribe_complete':
            handlers.onScribe(payload);
            return undefined;

        case 'decide_complete':
            handlers.onDecide(payload);
            return undefined;

        case 'completed':
            handlers.onCompleted(payload);
            return { status: 'completed' };

        default:
            return undefined;
    }
}

function parseEvent(rawData: string): RawAriseEvent | undefined {
    try {
        return JSON.parse(rawData) as RawAriseEvent;
    } catch {
        return undefined;
    }
}

function abortError(): Error {
    const error = new Error('Arise generation was cancelled');
    error.name = 'AbortError';
    return error;
}

function isAbort(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const abort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (signal.aborted) return abort();

        const timer = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => {
            clearTimeout(timer);
            abort();
        }, { once: true });
    });
}
