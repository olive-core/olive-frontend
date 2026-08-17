// A request cheap enough to repeat every three seconds, so the queue notices the network
// coming back without waiting out its own backoff.
//
// navigator.onLine is not used as the signal. It reports true on a captive portal and on
// hospital Wi-Fi with no upstream — both of which look online and deliver nothing.

const PROBE_PATH = "/api/v1/reachability";
const PROBE_INTERVAL_MS = 3_000;
const PROBE_TIMEOUT_MS = 4_000;

// The API answers with exactly this. A portal's login page cannot, which is the whole
// point of checking the body rather than the status code.
const REACHABLE_TOKEN = "olive-reachable";

export async function isApiReachable(): Promise<boolean> {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), PROBE_TIMEOUT_MS);
    try {
        // Plain fetch, no auth: this asks about the network, not about the session.
        const response = await fetch(PROBE_PATH, { cache: "no-store", signal: abort.signal });
        if (!response.ok) return false;
        const body = await response.json();
        return body?.reachable === REACHABLE_TOKEN;
    } catch {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

/** Resolves once the API answers properly. Never rejects; abort to stop polling. */
export function whenApiReachable(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        let timer: ReturnType<typeof setTimeout>;

        const poll = async () => {
            if (signal.aborted) return;
            if (await isApiReachable()) return resolve();
            if (!signal.aborted) timer = setTimeout(poll, PROBE_INTERVAL_MS);
        };

        timer = setTimeout(poll, PROBE_INTERVAL_MS);
        signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
    });
}
