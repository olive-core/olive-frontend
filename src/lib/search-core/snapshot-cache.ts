import api from "@/lib/axios";

// A reference dataset that rarely changes is cached in IndexedDB and only
// re-downloaded when the server reports a new version. One cache per entity
// (its own IndexedDB database).
interface SnapshotCacheOptions<T> {
    dbName: string;
    versionUrl: string;
    snapshotUrl: string;
    extractRecords: (payload: unknown) => T[];
}

export interface SnapshotCache<T> {
    load: () => Promise<T[]>;
}

interface CachedSnapshot<T> {
    version: string;
    records: T[];
}

const STORE_NAME = "snapshot";
const CACHE_KEY = "current";

export function createSnapshotCache<T>(options: SnapshotCacheOptions<T>): SnapshotCache<T> {
    async function load(): Promise<T[]> {
        const cached = await readCache();
        const serverVersion = await fetchVersion().catch(() => null);

        // A cache written in an older payload format has no `records` array; ignore it
        // and re-download so a format change self-heals instead of crashing index build.
        // Offline (serverVersion === null) still falls back to a usable cache.
        const usable = cached !== null && Array.isArray(cached.records);
        if (usable && (serverVersion === null || cached.version === serverVersion)) {
            return cached.records;
        }

        const fresh = await fetchSnapshot();
        await writeCache(fresh).catch(() => undefined);
        return fresh.records;
    }

    async function fetchVersion(): Promise<string> {
        const res = await api.get<{ version: string }>(options.versionUrl);
        return res.data.version;
    }

    async function fetchSnapshot(): Promise<CachedSnapshot<T>> {
        const res = await api.get<{ version: string }>(options.snapshotUrl);
        return { version: res.data.version, records: options.extractRecords(res.data) };
    }

    function openDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(options.dbName, 1);
            request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function readCache(): Promise<CachedSnapshot<T> | null> {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(CACHE_KEY);
            request.onsuccess = () => resolve((request.result as CachedSnapshot<T>) ?? null);
            request.onerror = () => reject(request.error);
        });
    }

    async function writeCache(snapshot: CachedSnapshot<T>): Promise<void> {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).put(snapshot, CACHE_KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    return { load };
}
