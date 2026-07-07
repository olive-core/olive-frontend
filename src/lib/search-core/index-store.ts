import { buildIndex, search } from "./rank";
import type { SnapshotCache } from "./snapshot-cache";
import type { IndexedRecord, SearchConfig, SearchHit } from "./types";

// A process-wide singleton index: the snapshot is loaded and normalized once, then
// every keystroke searches locally. Until it is ready, callers fall back to the server.
interface SearchIndexOptions<T> {
    cache: SnapshotCache<T>;
    config: SearchConfig<T>;
    defaultLimit?: number;
}

export interface SearchIndex<T> {
    ensureReady: () => Promise<void>;
    isReady: () => boolean;
    search: (query: string, limit?: number) => SearchHit<T>[];
}

export function createSearchIndex<T>(options: SearchIndexOptions<T>): SearchIndex<T> {
    let index: IndexedRecord<T>[] = [];
    let ready = false;
    let loadPromise: Promise<void> | null = null;

    async function build(): Promise<void> {
        try {
            const records = await options.cache.load();
            index = buildIndex(records, options.config);
            ready = true;
        } catch (error) {
            loadPromise = null; // Allow a later retry.
            throw error;
        }
    }

    return {
        ensureReady: () => (loadPromise ??= build()),
        isReady: () => ready,
        search: (query, limit) => search(query, index, options.config, limit ?? options.defaultLimit),
    };
}
