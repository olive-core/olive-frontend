// Empties the chunk queue in the background, forever, at whatever pace the network
// allows. The recorder never waits on it and never learns whether it succeeded — the
// recorder's only job is to write the chunk down.
//
// One drainer runs across every open tab, held by a Web Lock the same way the auth
// refresh in axios.ts is. Two tabs draining the same shared queue would upload
// everything twice.

import {
    acknowledgeChunk,
    pendingChunks,
    recordFailedAttempt,
    rejectChunk,
    tallyChunks,
    type QueuedChunk,
} from "./chunk-store";
import { uploadChunk, type UploadOutcome } from "./chunk-uploader";
import { whenApiReachable } from "./network-probe";
import { PARALLEL_UPLOADS, retryDelayMs, sleep, type DrainUrgency } from "./retry-schedule";

const DRAINER_LOCK = "olive-audio-drainer";

// An idle drainer is woken by its own tab enqueueing a chunk. This covers the case where
// the tab that was recording has closed and another tab inherits its unsent queue.
const IDLE_RECHECK_MS = 30_000;

export type QueueHealth =
    /** Everything captured is on the server. */
    | "secured"
    /** Uploads are moving. */
    | "syncing"
    /** Uploads are failing, and the queue is waiting for the network. */
    | "waiting"
    /** Something is stuck in a way retrying will not fix. */
    | "attention";

export interface QueueStatus {
    health:   QueueHealth;
    pending:  number;
    rejected: number;
}

let isRunning = false;
let urgency: DrainUrgency = "patient";
let consecutiveFailures = 0;
let releaseWait: (() => void) | null = null;
// A nudge that lands mid-drain has nothing to wake, and would otherwise be lost in the
// gap between the queue reading empty and the drainer settling down to wait.
let isWakePending = false;

let status: QueueStatus = { health: "secured", pending: 0, rejected: 0 };
const listeners = new Set<(status: QueueStatus) => void>();

export function startDrainer(): void {
    if (isRunning) return;
    isRunning = true;
    void drainForever();
}

export function stopDrainer(): void {
    isRunning = false;
    nudgeDrainer();
}

/** Wakes the drainer immediately — a new chunk landed, or the doctor is now waiting. */
export function nudgeDrainer(): void {
    isWakePending = true;
    releaseWait?.();
}

export function setDrainUrgency(next: DrainUrgency): void {
    if (urgency === next) return;
    urgency = next;
    nudgeDrainer();
}

export function queueStatus(): QueueStatus {
    return status;
}

export function subscribeToQueueStatus(listener: (status: QueueStatus) => void): () => void {
    listeners.add(listener);
    return () => void listeners.delete(listener);
}

async function drainForever(): Promise<void> {
    while (isRunning) {
        const outcome = await withDrainerLock(drainUntilBlocked);
        await (outcome === "empty" ? waitForWork() : waitBeforeRetrying());
    }
}

/** Uploads oldest-first until the queue is empty or the network stops cooperating. */
async function drainUntilBlocked(): Promise<"empty" | "blocked"> {
    while (isRunning) {
        const batch = await pendingChunks(PARALLEL_UPLOADS[urgency]);
        if (batch.length === 0) {
            await publishStatus();
            return "empty";
        }

        const outcomes = await Promise.all(batch.map(settleChunk));
        const isBlocked = outcomes.includes("retry");
        consecutiveFailures = isBlocked ? consecutiveFailures + 1 : 0;
        await publishStatus();

        if (isBlocked) return "blocked";
    }
    return "empty";
}

async function settleChunk(chunk: QueuedChunk): Promise<UploadOutcome> {
    const outcome = await uploadChunk(chunk);
    const { sessionId, chunkIndex } = chunk;

    if (outcome === "acked") await acknowledgeChunk(sessionId, chunkIndex);
    else if (outcome === "rejected") await rejectChunk(sessionId, chunkIndex);
    else await recordFailedAttempt(sessionId, chunkIndex);

    return outcome;
}

// Whichever comes first: the backoff elapsing, the probe finding the network, or a nudge.
// On a connection that comes back it is always the probe, which is why the backoff above
// can afford to grow to thirty seconds.
function waitBeforeRetrying(): Promise<void> {
    return raceAgainstNudge((signal) => [
        sleep(retryDelayMs(urgency, consecutiveFailures), signal),
        whenApiReachable(signal),
    ]);
}

function waitForWork(): Promise<void> {
    return raceAgainstNudge((signal) => [sleep(IDLE_RECHECK_MS, signal)]);
}

async function raceAgainstNudge(
    contenders: (signal: AbortSignal) => Promise<void>[],
): Promise<void> {
    if (isWakePending) {
        isWakePending = false;
        return;
    }

    const abort = new AbortController();
    const nudged = new Promise<void>((resolve) => {
        releaseWait = resolve;
    });

    try {
        await Promise.race([nudged, ...contenders(abort.signal)]);
    } finally {
        abort.abort();
        releaseWait = null;
        isWakePending = false;
    }
}

async function withDrainerLock<T>(run: () => Promise<T>): Promise<T> {
    if (!navigator.locks?.request) return run();
    return await navigator.locks.request(DRAINER_LOCK, run);
}

async function publishStatus(): Promise<void> {
    const { pending, rejected } = await tallyChunks();
    status = { health: healthOf(pending, rejected), pending, rejected };
    listeners.forEach((listener) => listener(status));
}

function healthOf(pending: number, rejected: number): QueueHealth {
    if (rejected > 0) return "attention";
    if (pending === 0) return "secured";
    return consecutiveFailures > 0 ? "waiting" : "syncing";
}
