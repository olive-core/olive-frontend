// Answers "does the server have everything this consultation recorded?" — the question a
// draft must not be generated without, because a transcript with holes in it reads exactly
// like a complete one.

import { sessionChunks } from "./chunk-store";
import { subscribeToQueueStatus } from "./drainer";
import { sleep } from "./retry-schedule";

export type DeliveryWait = "delivered" | "still-waiting";

export async function unsentChunkCount(sessionId: string): Promise<number> {
    const chunks = await sessionChunks(sessionId);
    return chunks.filter((chunk) => chunk.state !== "acked").length;
}

/**
 * Waits for the session's audio to reach the server, giving up after timeoutMs so the
 * caller can hand the decision to the doctor rather than block them indefinitely.
 */
export async function waitForDelivery(
    sessionId: string,
    timeoutMs: number,
    signal: AbortSignal,
): Promise<DeliveryWait> {
    const round = new AbortController();
    const endRound = () => round.abort();
    signal.addEventListener("abort", endRound, { once: true });

    try {
        return await Promise.race([
            whenSessionDelivered(sessionId, round.signal).then(() => "delivered" as const),
            sleep(timeoutMs, round.signal).then(() => "still-waiting" as const),
        ]);
    } finally {
        round.abort();
        signal.removeEventListener("abort", endRound);
    }
}

/** Resolves once nothing of this session is left unsent. Never rejects; abort to stop. */
function whenSessionDelivered(sessionId: string, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        const check = async () => {
            if (signal.aborted) return;
            if ((await unsentChunkCount(sessionId)) > 0) return;
            unsubscribe();
            resolve();
        };

        const unsubscribe = subscribeToQueueStatus(() => void check());
        signal.addEventListener("abort", unsubscribe, { once: true });
        void check();
    });
}
