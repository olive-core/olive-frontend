// Client-side hospital search using the same mechanism as the medicine search:
// identical normalization and ranking ladder (exact -> first word -> prefix ->
// word boundary -> substring -> fuzzy), over a full list fetched once.
// See src/lib/medicine-search/rank.ts for the reference implementation.
import { toKey, toNorm } from "@/lib/medicine-search/normalize";
import type { Hospital } from "@/types/attendant-queue";

const FUZZY_TIER = 5;
const FUZZY_MIN_QUERY_LENGTH = 4;
const FUZZY_MAX_DISTANCE = 2;
const FUZZY_TRIGGER_COUNT = 8;

type IndexedHospital = {
    hospital: Hospital;
    norm: string;
    key: string;
};

type HospitalMatch = {
    hospital: Hospital;
    tier: number;
    distance: number;
};

export function indexHospitals(hospitals: Hospital[]): IndexedHospital[] {
    return hospitals.map((hospital) => {
        const name = hospital.name_en ?? "";
        return { hospital, norm: toNorm(name), key: toKey(name) };
    });
}

export function rankHospitals(query: string, index: IndexedHospital[], limit = 8): Hospital[] {
    const qNorm = toNorm(query);
    const qKey = toKey(query);
    if (!qKey) return [];

    const matches: HospitalMatch[] = [];
    for (const item of index) {
        const tier = literalTier(item.norm, item.key, qNorm, qKey);
        if (tier !== null) matches.push({ hospital: item.hospital, tier, distance: 0 });
    }

    if (matches.length < FUZZY_TRIGGER_COUNT && qKey.length >= FUZZY_MIN_QUERY_LENGTH) {
        appendFuzzyMatches(matches, index, qKey);
    }

    matches.sort(compareMatches);
    return matches.slice(0, limit).map((match) => match.hospital);
}

function literalTier(norm: string, key: string, qNorm: string, qKey: string): number | null {
    if (key === qKey) return 0;
    if (norm.startsWith(`${qNorm} `)) return 1;
    if (key.startsWith(qKey)) return 2;
    if (norm.includes(` ${qNorm}`)) return 3;
    if (key.includes(qKey)) return 4;
    return null;
}

function appendFuzzyMatches(matches: HospitalMatch[], index: IndexedHospital[], qKey: string): void {
    const alreadyMatched = new Set(matches.map((match) => match.hospital.hospital_id));
    for (const item of index) {
        if (alreadyMatched.has(item.hospital.hospital_id)) continue;
        const distance = boundedLevenshtein(item.key.slice(0, qKey.length), qKey, FUZZY_MAX_DISTANCE);
        if (distance <= FUZZY_MAX_DISTANCE) {
            matches.push({ hospital: item.hospital, tier: FUZZY_TIER, distance });
        }
    }
}

function compareMatches(a: HospitalMatch, b: HospitalMatch): number {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return (a.hospital.name_en ?? "").localeCompare(b.hospital.name_en ?? "");
}

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
