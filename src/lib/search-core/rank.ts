import { toKey, toNorm } from "./normalize";
import { prefixDistance } from "./distance";
import type { IndexedField, IndexedRecord, SearchConfig, SearchField, SearchHit } from "./types";

// Ranking ladder (single source of truth, mirrored by the backend tiered queries):
//   0 exact · 1 first word · 2 prefix · 3 word boundary · 4 substring · 5 fuzzy
// A "prefix" field stops at tier 2; a "substring" field goes to tier 4. Fuzzy only
// kicks in for longer queries when literal matches are scarce, so the common case
// stays a few string comparisons.
const FUZZY_TIER = 5;
const DEFAULT_FUZZY_MIN_QUERY_LENGTH = 4;
const DEFAULT_FUZZY_MAX_DISTANCE = 2;
const DEFAULT_FUZZY_TRIGGER_COUNT = 8;

interface Scored<T> {
    item: IndexedRecord<T>;
    tier: number;
    distance: number;
    fieldPriority: number;
}

export function buildIndex<T>(records: T[], config: SearchConfig<T>): IndexedRecord<T>[] {
    return records.map(record => {
        const fields = config.fields.map(field => indexField(record, field));
        const primary = fields.reduce((best, field) => (field.priority < best.priority ? field : best));
        return { record, fields, primary };
    });
}

export function search<T>(
    query: string,
    index: IndexedRecord<T>[],
    config: SearchConfig<T>,
    limit?: number,
): SearchHit<T>[] {
    const qNorm = toNorm(query);
    const qKey = toKey(query);
    if (!qKey) return [];

    const results: Scored<T>[] = [];
    for (const item of index) {
        const match = literalMatch(item, qNorm, qKey);
        if (match) results.push({ item, distance: 0, ...match });
    }

    const trigger = config.fuzzyTriggerCount ?? DEFAULT_FUZZY_TRIGGER_COUNT;
    const minLength = config.fuzzyMinQueryLength ?? DEFAULT_FUZZY_MIN_QUERY_LENGTH;
    if (results.length < trigger && qKey.length >= minLength) {
        appendFuzzyMatches(results, index, qKey, config);
    }

    results.sort(compareScored);
    const limited = limit ? results.slice(0, limit) : results;
    return limited.map(({ item, tier, distance }) => ({ record: item.record, tier, distance }));
}

function indexField<T>(record: T, field: SearchField<T>): IndexedField {
    const value = field.value(record);
    return { norm: toNorm(value), key: toKey(value), width: field.width, priority: field.priority };
}

// The best (lowest) tier across a record's fields, and the priority of the field that
// produced it — so an equal-tier match on a higher-priority field wins the tie.
function literalMatch<T>(
    item: IndexedRecord<T>,
    qNorm: string,
    qKey: string,
): { tier: number; fieldPriority: number } | null {
    let best: { tier: number; fieldPriority: number } | null = null;
    for (const field of item.fields) {
        const tier = fieldTier(field, qNorm, qKey);
        if (tier === null) continue;
        if (best === null || tier < best.tier || (tier === best.tier && field.priority < best.fieldPriority)) {
            best = { tier, fieldPriority: field.priority };
        }
    }
    return best;
}

function fieldTier(field: IndexedField, qNorm: string, qKey: string): number | null {
    if (field.key === qKey) return 0;
    if (field.norm.startsWith(`${qNorm} `)) return 1;
    if (field.key.startsWith(qKey)) return 2;
    if (field.width === "prefix") return null;
    if (field.norm.includes(` ${qNorm}`)) return 3;
    if (field.key.includes(qKey)) return 4;
    return null;
}

function appendFuzzyMatches<T>(
    results: Scored<T>[],
    index: IndexedRecord<T>[],
    qKey: string,
    config: SearchConfig<T>,
): void {
    const maxDistance = config.fuzzyMaxDistance ?? DEFAULT_FUZZY_MAX_DISTANCE;
    const alreadyMatched = new Set(results.map(result => config.identity(result.item.record)));
    for (const item of index) {
        if (alreadyMatched.has(config.identity(item.record))) continue;
        let distance = Infinity;
        let fieldPriority = 0;
        for (const field of item.fields) {
            const fieldDistance = prefixDistance(field.key, qKey, maxDistance);
            if (fieldDistance < distance) {
                distance = fieldDistance;
                fieldPriority = field.priority;
            }
        }
        if (distance <= maxDistance) results.push({ item, tier: FUZZY_TIER, distance, fieldPriority });
    }
}

function compareScored<T>(a: Scored<T>, b: Scored<T>): number {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.fieldPriority !== b.fieldPriority) return a.fieldPriority - b.fieldPriority;
    if (a.item.primary.key.length !== b.item.primary.key.length) {
        return a.item.primary.key.length - b.item.primary.key.length;
    }
    return a.item.primary.norm.localeCompare(b.item.primary.norm);
}
