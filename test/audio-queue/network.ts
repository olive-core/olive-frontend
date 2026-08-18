// The network profiles the queue has to survive. Each one stands in for a real hospital
// failure, and the nastiest is deliberately included: a captive portal answers 200 to
// everything, so a client that trusts status codes marks lost audio as delivered.

export type NetworkProfile =
    | "online"
    | "offline"
    | "flaky"
    | "captive-portal"
    /** The server stored the chunk; the answer never arrived. The client retries it. */
    | "succeeds-but-times-out"
    | "rejects";

export interface DeliveredChunk {
    sessionId:  string;
    chunkIndex: number;
}

// Deterministic rather than random: "one in three" that varies run to run turns a real
// regression and an unlucky seed into the same red test.
const FLAKY_PERIOD = 3;

export const network = {
    profile: "online" as NetworkProfile,
    /** Every chunk the server actually received, replays included. */
    delivered: [] as DeliveredChunk[],
    requestCount: 0,
    reset(profile: NetworkProfile = "online") {
        this.profile = profile;
        this.delivered = [];
        this.requestCount = 0;
    },
    /** What the server holds once duplicates are collapsed, in recording order. */
    storedChunkIndexes(sessionId: string): number[] {
        const stored = new Set(
            this.delivered.filter((c) => c.sessionId === sessionId).map((c) => c.chunkIndex),
        );
        return [...stored].sort((a, b) => a - b);
    },
    deliveryCount(sessionId: string, chunkIndex: number): number {
        return this.delivered.filter(
            (c) => c.sessionId === sessionId && c.chunkIndex === chunkIndex,
        ).length;
    },
};

class StubAxiosError extends Error {
    isAxiosError = true;
    response?: { status: number };
    constructor(message: string, status?: number) {
        super(message);
        this.response = status === undefined ? undefined : { status };
    }
}

function receive(formData: FormData): void {
    network.delivered.push({
        sessionId:  String(formData.get("session_id")),
        chunkIndex: Number(formData.get("chunk_index")),
    });
}

function answerChunkUpload(formData: FormData) {
    network.requestCount += 1;

    switch (network.profile) {
        case "offline":
            throw new StubAxiosError("Network Error");

        case "flaky":
            if (network.requestCount % FLAKY_PERIOD === 0) throw new StubAxiosError("Network Error");
            receive(formData);
            return { data: { status: "processed", segments: [], timings: {} } };

        case "captive-portal":
            // 200 OK, and a login page where the answer should be.
            return { data: "<!doctype html><html><body>Sign in to the guest network</body></html>" };

        case "succeeds-but-times-out":
            receive(formData);
            throw new StubAxiosError("timeout of 0ms exceeded");

        case "rejects":
            throw new StubAxiosError("Bad Request", 400);

        default:
            receive(formData);
            return { data: { status: "processed", segments: [], timings: {} } };
    }
}

const api = {
    post: async (url: string, body: unknown) => {
        if (url.includes("/conversation/chunk")) return answerChunkUpload(body as FormData);
        return { data: {} };
    },
    get:    async () => ({ data: {} }),
    put:    async () => ({ data: {} }),
    delete: async () => ({ data: {} }),
};

export default api;

/**
 * Answers the reachability probe on the same network. A dropped request does not mean the
 * API is down, so a flaky link still probes as reachable — which is the distinction the
 * probe exists to make.
 */
export function installProbeNetwork(): void {
    globalThis.fetch = (async () => {
        if (network.profile === "offline") throw new TypeError("fetch failed");
        if (network.profile === "captive-portal") {
            return { ok: true, json: async () => { throw new SyntaxError("Unexpected token <"); } };
        }
        return { ok: true, json: async () => ({ reachable: "olive-reachable" }) };
    }) as unknown as typeof fetch;
}
