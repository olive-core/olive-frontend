// Separator-insensitive normalization shared by every local search index. Kept
// identical to the backend so a keyword ranks the same locally and on the server.
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
