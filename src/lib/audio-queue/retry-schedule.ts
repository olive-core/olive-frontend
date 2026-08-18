// How long the queue waits between upload attempts.
//
// Backoff exists so a dead network is not hammered with 200 KB requests, and it is
// deliberately conservative here. It is *not* how recovery is noticed — the probe in
// network-probe.ts does that on its own three-second clock, so a long backoff never
// costs more than a few seconds of lag. That split is what lets the delays below grow.

export type DrainUrgency =
    /** Recording is still running. Nobody is waiting on an upload, so take it slowly. */
    | "patient"
    /** The doctor has pressed Finish and is watching a spinner. Push. */
    | "urgent";

// The urgent ladder floors at the probe interval: below that the probe would notice
// recovery first anyway, so retrying faster only adds requests to a struggling link.
const RETRY_DELAYS_MS: Record<DrainUrgency, number[]> = {
    patient: [500, 1_500, 4_000, 10_000, 20_000, 30_000],
    urgent:  [0, 500, 1_000, 2_000, 3_000],
};

// Spreads the retries of several devices that all lost the same access point.
const JITTER_FRACTION = 0.25;

export const PARALLEL_UPLOADS: Record<DrainUrgency, number> = {
    patient: 1,
    urgent:  3,
};

/** @param consecutiveFailures attempts that have failed in a row — one or more. */
export function retryDelayMs(urgency: DrainUrgency, consecutiveFailures: number): number {
    const ladder = RETRY_DELAYS_MS[urgency];
    const step = ladder[Math.min(consecutiveFailures - 1, ladder.length - 1)];
    return Math.round(step * (1 + (Math.random() * 2 - 1) * JITTER_FRACTION));
}

export function sleep(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        if (signal.aborted) return resolve();
        const timer = setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            resolve();
        }, { once: true });
    });
}
