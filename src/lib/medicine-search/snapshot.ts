import api from "@/lib/axios";
import type { MedicineSnapshot } from "./types";

// The medicine directory rarely changes, so the snapshot is cached in IndexedDB
// and only re-downloaded when the server reports a new version.
const DB_NAME = "olive-medicine";
const STORE_NAME = "snapshot";
const CACHE_KEY = "current";

export async function loadSnapshot(): Promise<MedicineSnapshot> {
    const cached = await readCache();
    const serverVersion = await fetchVersion().catch(() => null);

    // Offline (serverVersion === null) falls back to whatever is cached.
    if (cached && (serverVersion === null || cached.version === serverVersion)) {
        return cached;
    }

    const fresh = await fetchSnapshot();
    await writeCache(fresh).catch(() => undefined);
    return fresh;
}

async function fetchVersion(): Promise<string> {
    const res = await api.get<{ version: string }>("/medicine/snapshot/version");
    return res.data.version;
}

async function fetchSnapshot(): Promise<MedicineSnapshot> {
    const res = await api.get<MedicineSnapshot>("/medicine/snapshot");
    return res.data;
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function readCache(): Promise<MedicineSnapshot | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(CACHE_KEY);
        request.onsuccess = () => resolve((request.result as MedicineSnapshot) ?? null);
        request.onerror = () => reject(request.error);
    });
}

async function writeCache(snapshot: MedicineSnapshot): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(snapshot, CACHE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
