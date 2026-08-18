// A queue that only grows is a bug with a delay on it. Every local write needs a matching
// delete, and the server's acknowledgement is what triggers it: the audio goes as soon as
// the chunk is acknowledged, and the receipt that replaces it goes once the consultation
// is behind us.
//
// One rule is never bent: unacknowledged audio is not deleted to free space — not by age,
// not by quota pressure, not by a sweep. Only the doctor discarding a recording removes
// audio the server has not confirmed.

import { allChunks, deleteChunk, type QueuedChunk } from "./chunk-store";

// Receipts are ~100 bytes and only matter while a consultation is in progress. A day
// covers a clinic that ran long and a doctor who never closed the tab.
const RECEIPT_LIFETIME_MS = 24 * 60 * 60 * 1000;

// Browsers evict aggressively near the budget, so sweep well before the ceiling.
const QUOTA_PRESSURE_RATIO = 0.8;

/** Asks the browser not to evict the queue. A refusal is a heuristic, not a failure. */
export async function requestPersistentStorage(): Promise<void> {
    if (!navigator.storage?.persist) return;
    try {
        await navigator.storage.persist();
    } catch (error) {
        console.warn("[audio-queue] persistent storage was not granted:", error);
    }
}

/**
 * Checked before a new recording starts, never during one — running out of room is a
 * reason to refuse to begin, and never a reason to interrupt a consultation in progress.
 */
export async function hasRoomToRecord(): Promise<boolean> {
    if (!navigator.storage?.estimate) return true;
    if (!(await isUnderQuotaPressure())) return true;

    await sweepSyncedChunks();
    return !(await isUnderQuotaPressure());
}

/** Drops receipts for consultations that finished long enough ago to be irrelevant. */
export async function sweepSyncedChunks(): Promise<number> {
    const expiry = Date.now() - RECEIPT_LIFETIME_MS;
    const expired = (await allChunks()).filter(
        (chunk) => isSynced(chunk) && chunk.createdAt < expiry,
    );
    await removeAll(expired);
    return expired.length;
}

/** The consultation is saved and closed, so its receipts have nothing left to prove. */
export async function clearSyncedSessionChunks(sessionId: string): Promise<void> {
    const chunks = await allChunks();
    await removeAll(chunks.filter((chunk) => chunk.sessionId === sessionId && isSynced(chunk)));
}

/**
 * The doctor discarded the recording, which is the one instruction that removes audio the
 * server never confirmed.
 */
export async function forgetDiscardedSession(sessionId: string): Promise<void> {
    const chunks = await allChunks();
    await removeAll(chunks.filter((chunk) => chunk.sessionId === sessionId));
}

function isSynced(chunk: QueuedChunk): boolean {
    return chunk.state === "acked";
}

async function removeAll(chunks: QueuedChunk[]): Promise<void> {
    await Promise.all(chunks.map((chunk) => deleteChunk(chunk.sessionId, chunk.chunkIndex)));
}

async function isUnderQuotaPressure(): Promise<boolean> {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return quota > 0 && usage / quota > QUOTA_PRESSURE_RATIO;
}
