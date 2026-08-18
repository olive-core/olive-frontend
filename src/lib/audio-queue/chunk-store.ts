// The device's own record of every captured audio chunk, written before the network is
// touched. Until the server acknowledges a chunk, this is the only copy that exists — so
// a failed upload becomes a delay rather than lost consultation audio.
//
// An acknowledged chunk keeps a receipt but drops its audio, which is what stops the
// device filling up. See storage-lifecycle.ts for when receipts themselves are cleared.

export type ChunkState =
    /** Captured, not yet acknowledged by the server. Still holds its audio. */
    | "pending"
    /** The server has it. Audio dropped, receipt kept. */
    | "acked"
    /** The server refused it in a way retrying cannot fix. Audio deliberately kept. */
    | "rejected";

export interface QueuedChunk {
    sessionId:   string;
    chunkIndex:  number;
    blob:        Blob | null;
    mimeType:    string;
    byteSize:    number;
    chunkSizeMs: number;
    overlapMs:   number;
    state:       ChunkState;
    attempts:    number;
    createdAt:   number;
}

export interface ChunkTally {
    pending:  number;
    rejected: number;
}

const DATABASE_NAME = "olive-audio-queue";
const DATABASE_VERSION = 1;
const STORE_NAME = "chunks";
const STATE_INDEX = "state_createdAt";

interface ChunkBackend {
    /** False when audio survives only until the tab closes, so callers can warn honestly. */
    readonly isDurable: boolean;
    put(chunk: QueuedChunk): Promise<void>;
    remove(sessionId: string, chunkIndex: number): Promise<void>;
    read(sessionId: string, chunkIndex: number): Promise<QueuedChunk | undefined>;
    readByState(state: ChunkState, limit?: number): Promise<QueuedChunk[]>;
    readAll(): Promise<QueuedChunk[]>;
}

let backendPromise: Promise<ChunkBackend> | null = null;

function backend(): Promise<ChunkBackend> {
    backendPromise ??= openIndexedDbBackend().catch((error) => {
        // Private browsing and blocked storage both fail here. Recording with a
        // memory-backed queue is worse than IndexedDB and better than not recording.
        console.warn("[audio-queue] falling back to in-memory storage:", error);
        return memoryBackend();
    });
    return backendPromise;
}

export async function isQueueDurable(): Promise<boolean> {
    return (await backend()).isDurable;
}

export async function enqueueChunk(
    chunk: Omit<QueuedChunk, "state" | "attempts" | "createdAt">,
): Promise<void> {
    const store = await backend();
    await store.put({ ...chunk, state: "pending", attempts: 0, createdAt: Date.now() });
}

/** Chunks still owed to the server, oldest first. */
export async function pendingChunks(limit: number): Promise<QueuedChunk[]> {
    return (await backend()).readByState("pending", limit);
}

/** The server has the chunk: drop the audio, keep the receipt. */
export async function acknowledgeChunk(sessionId: string, chunkIndex: number): Promise<void> {
    await amendChunk(sessionId, chunkIndex, (chunk) => ({ ...chunk, blob: null, state: "acked" }));
}

/** The server refused the chunk permanently. The audio stays, for export or a later fix. */
export async function rejectChunk(sessionId: string, chunkIndex: number): Promise<void> {
    await amendChunk(sessionId, chunkIndex, (chunk) => ({ ...chunk, state: "rejected" }));
}

export async function recordFailedAttempt(sessionId: string, chunkIndex: number): Promise<void> {
    await amendChunk(sessionId, chunkIndex, (chunk) => ({ ...chunk, attempts: chunk.attempts + 1 }));
}

export async function tallyChunks(sessionId?: string): Promise<ChunkTally> {
    const chunks = await (await backend()).readAll();
    const scoped = sessionId ? chunks.filter((chunk) => chunk.sessionId === sessionId) : chunks;
    return {
        pending:  scoped.filter((chunk) => chunk.state === "pending").length,
        rejected: scoped.filter((chunk) => chunk.state === "rejected").length,
    };
}

export async function sessionChunks(sessionId: string): Promise<QueuedChunk[]> {
    const chunks = await (await backend()).readAll();
    return chunks.filter((chunk) => chunk.sessionId === sessionId);
}

export async function allChunks(): Promise<QueuedChunk[]> {
    return (await backend()).readAll();
}

export async function deleteChunk(sessionId: string, chunkIndex: number): Promise<void> {
    await (await backend()).remove(sessionId, chunkIndex);
}

async function amendChunk(
    sessionId: string,
    chunkIndex: number,
    amend: (chunk: QueuedChunk) => QueuedChunk,
): Promise<void> {
    const store = await backend();
    const existing = await store.read(sessionId, chunkIndex);
    if (!existing) return;
    await store.put(amend(existing));
}

async function openIndexedDbBackend(): Promise<ChunkBackend> {
    if (typeof indexedDB === "undefined") throw new Error("IndexedDB is unavailable");
    const database = await openDatabase();

    const transact = <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) =>
        new Promise<T>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, mode);
            const request = run(transaction.objectStore(STORE_NAME));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            transaction.onabort = () => reject(transaction.error);
        });

    return {
        isDurable: true,
        put:    (chunk) => transact("readwrite", (store) => store.put(chunk)).then(() => undefined),
        remove: (sessionId, chunkIndex) =>
            transact("readwrite", (store) => store.delete([sessionId, chunkIndex])).then(() => undefined),
        read:   (sessionId, chunkIndex) =>
            transact<QueuedChunk | undefined>("readonly", (store) => store.get([sessionId, chunkIndex])),
        readByState: (state, limit) =>
            transact<QueuedChunk[]>("readonly", (store) =>
                store.index(STATE_INDEX).getAll(
                    IDBKeyRange.bound([state, 0], [state, Number.MAX_SAFE_INTEGER]),
                    limit,
                ),
            ),
        readAll: () => transact<QueuedChunk[]>("readonly", (store) => store.getAll()),
    };
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onupgradeneeded = () => {
            const store = request.result.createObjectStore(STORE_NAME, {
                keyPath: ["sessionId", "chunkIndex"],
            });
            // Draining wants the oldest unsent chunk, which this answers without a scan.
            store.createIndex(STATE_INDEX, ["state", "createdAt"]);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("IndexedDB upgrade blocked by another tab"));
    });
}

function memoryBackend(): ChunkBackend {
    const chunks = new Map<string, QueuedChunk>();
    const keyOf = (sessionId: string, chunkIndex: number) => `${sessionId}:${chunkIndex}`;
    const sortedByAge = () => [...chunks.values()].sort((a, b) => a.createdAt - b.createdAt);

    return {
        isDurable: false,
        put:    async (chunk) => void chunks.set(keyOf(chunk.sessionId, chunk.chunkIndex), chunk),
        remove: async (sessionId, chunkIndex) => void chunks.delete(keyOf(sessionId, chunkIndex)),
        read:   async (sessionId, chunkIndex) => chunks.get(keyOf(sessionId, chunkIndex)),
        readByState: async (state, limit) =>
            sortedByAge().filter((chunk) => chunk.state === state).slice(0, limit ?? Infinity),
        readAll: async () => sortedByAge(),
    };
}
