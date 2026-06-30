import { toKey, toNorm } from "./normalize";
import type { IndexedMedicine, MedicineRecord, SearchResult } from "./types";

// Ranking ladder — single source of truth, mirrored by the backend tiered query:
//   0 exact · 1 first word · 2 prefix · 3 word boundary · 4 substring · 5 fuzzy
// Brand (trade) matches tiers 0-2 (precision); generic matches 0-4 (recall).
const FUZZY_TIER = 5;
const FUZZY_MIN_QUERY_LENGTH = 4;
const FUZZY_MAX_DISTANCE = 2;
// Only widen to typo-tolerant matching when literal matches are scarce, so the
// common case stays a few string comparisons.
const FUZZY_TRIGGER_COUNT = 8;

export function indexMedicine(record: MedicineRecord): IndexedMedicine {
    const trade = record.trade_name ?? "";
    const generic = record.generic_name_strength ?? "";
    return {
        record,
        tradeNorm: toNorm(trade),
        tradeKey: toKey(trade),
        genericNorm: toNorm(generic),
        genericKey: toKey(generic),
    };
}

export function rankMedicines(query: string, index: IndexedMedicine[], limit?: number): SearchResult[] {
    const qNorm = toNorm(query);
    const qKey = toKey(query);
    if (!qKey) return [];

    const results: SearchResult[] = [];
    for (const item of index) {
        const match = literalMatch(item, qNorm, qKey);
        if (match) results.push({ item, distance: 0, ...match });
    }

    if (results.length < FUZZY_TRIGGER_COUNT && qKey.length >= FUZZY_MIN_QUERY_LENGTH) {
        appendFuzzyMatches(results, index, qKey);
    }

    results.sort(compareResults);
    return limit ? results.slice(0, limit) : results;
}

// The best tier for a record, plus whether the brand field produced it (brand
// wins on a tie, so equal-tier brand matches outrank generic-only matches).
function literalMatch(
    item: IndexedMedicine,
    qNorm: string,
    qKey: string,
): { tier: number; matchedBrand: boolean } | null {
    const brand = brandTier(item.tradeNorm, item.tradeKey, qNorm, qKey);
    const generic = genericTier(item.genericNorm, item.genericKey, qNorm, qKey);
    if (brand === null && generic === null) return null;
    if (generic === null) return { tier: brand!, matchedBrand: true };
    if (brand === null) return { tier: generic, matchedBrand: false };
    return brand <= generic
        ? { tier: brand, matchedBrand: true }
        : { tier: generic, matchedBrand: false };
}

function brandTier(norm: string, key: string, qNorm: string, qKey: string): number | null {
    if (key === qKey) return 0;
    if (norm.startsWith(`${qNorm} `)) return 1;
    if (key.startsWith(qKey)) return 2;
    return null;
}

function genericTier(norm: string, key: string, qNorm: string, qKey: string): number | null {
    if (key === qKey) return 0;
    if (norm.startsWith(`${qNorm} `)) return 1;
    if (key.startsWith(qKey)) return 2;
    if (norm.includes(` ${qNorm}`)) return 3;
    if (key.includes(qKey)) return 4;
    return null;
}

function appendFuzzyMatches(results: SearchResult[], index: IndexedMedicine[], qKey: string): void {
    const alreadyMatched = new Set(results.map(result => result.item.record.medicine_id));
    for (const item of index) {
        if (alreadyMatched.has(item.record.medicine_id)) continue;
        const tradeDistance = prefixDistance(item.tradeKey, qKey);
        const genericDistance = prefixDistance(item.genericKey, qKey);
        const distance = Math.min(tradeDistance, genericDistance);
        if (distance <= FUZZY_MAX_DISTANCE) {
            results.push({ item, tier: FUZZY_TIER, distance, matchedBrand: tradeDistance <= genericDistance });
        }
    }
}

// Anchor typo tolerance to the start of the name so a trailing strength
// ("Paracetamol 500 mg") never inflates the distance — mirrors MedEx.
function prefixDistance(key: string, qKey: string): number {
    return boundedLevenshtein(key.slice(0, qKey.length), qKey, FUZZY_MAX_DISTANCE);
}

function compareResults(a: SearchResult, b: SearchResult): number {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.matchedBrand !== b.matchedBrand) return a.matchedBrand ? -1 : 1;
    if (a.item.tradeKey.length !== b.item.tradeKey.length) {
        return a.item.tradeKey.length - b.item.tradeKey.length;
    }
    return (a.item.record.trade_name ?? "").localeCompare(b.item.record.trade_name ?? "");
}

// Levenshtein distance that gives up (returns Infinity) once it exceeds maxDistance,
// so most non-matches are rejected in O(1) by the length pre-check.
function boundedLevenshtein(a: string, b: string, maxDistance: number): number {
    if (Math.abs(a.length - b.length) > maxDistance) return Infinity;
    if (a === b) return 0;

    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        let rowBest = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            const distance = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
            current.push(distance);
            if (distance < rowBest) rowBest = distance;
        }
        if (rowBest > maxDistance) return Infinity;
        previous = current;
    }
    return previous[b.length] <= maxDistance ? previous[b.length] : Infinity;
}
