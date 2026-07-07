// A searchable field on a record. `width` sets how wide matching goes:
//   "prefix"    → tiers 0-2 (exact, first-word, prefix) — precision (e.g. brand names)
//   "substring" → tiers 0-4 (adds word-boundary, substring) — recall (e.g. generics)
// `priority` breaks ties between fields: the lower value wins (the primary field is 0).
export type FieldMatchWidth = "prefix" | "substring";

export interface SearchField<T> {
    value: (record: T) => string;
    width: FieldMatchWidth;
    priority: number;
}

export interface SearchConfig<T> {
    identity: (record: T) => string;
    fields: SearchField<T>[];
    fuzzyMinQueryLength?: number;
    fuzzyMaxDistance?: number;
    fuzzyTriggerCount?: number;
}

// A field with its normalized matching strings precomputed once at index build time.
export interface IndexedField {
    norm: string;
    key: string;
    width: FieldMatchWidth;
    priority: number;
}

export interface IndexedRecord<T> {
    record: T;
    fields: IndexedField[];
    primary: IndexedField; // lowest-priority field, used for tie-break ordering
}

export interface SearchHit<T> {
    record: T;
    tier: number;
    distance: number;
}
