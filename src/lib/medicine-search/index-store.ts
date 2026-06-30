import { indexMedicine, rankMedicines } from "./rank";
import { loadSnapshot } from "./snapshot";
import type { IndexedMedicine, SearchResult } from "./types";

// Process-wide singleton: the snapshot is loaded and normalized once, then every
// keystroke searches locally. Until it is ready, callers fall back to the server.
let index: IndexedMedicine[] = [];
let ready = false;
let loadPromise: Promise<void> | null = null;

export function isMedicineIndexReady(): boolean {
    return ready;
}

export function ensureMedicineIndex(): Promise<void> {
    if (!loadPromise) loadPromise = buildIndex();
    return loadPromise;
}

async function buildIndex(): Promise<void> {
    try {
        const snapshot = await loadSnapshot();
        index = snapshot.medicines.map(indexMedicine);
        ready = true;
    } catch (error) {
        loadPromise = null; // Allow a later retry.
        throw error;
    }
}

export function searchMedicineIndex(query: string, limit?: number): SearchResult[] {
    return rankMedicines(query, index, limit);
}
