// Normalization is separator-insensitive and must stay identical to the backend
// (olive-backend/app/services/medicine_search.py) so ranking matches on both sides.
// "napa extra", "napa-extra" and "napaextra" all collapse to the same key.

const NON_ALPHANUMERIC = /[^a-z0-9]+/g;

// Lowercased, punctuation collapsed to single spaces, trimmed. Keeps word boundaries.
export function toNorm(value: string): string {
    return value.toLowerCase().replace(NON_ALPHANUMERIC, " ").trim();
}

// The norm with every separator removed. Used for exact/prefix/substring matching.
export function toKey(value: string): string {
    return toNorm(value).replace(/ /g, "");
}
