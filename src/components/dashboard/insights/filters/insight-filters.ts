import { DEFAULT_PERIOD, periodStart, type PeriodKey } from "./periods";

/** What the doctor is looking at. One period, plus whatever they narrowed to. */
export type InsightFilters = {
    period:     PeriodKey;
    complaint?: string;
    diagnosis?: string;
    medicine?:  string;
    ageMin?:    number;
    ageMax?:    number;
    sex?:       string;
    chamberId?: string;
}

/** The fields the doctor searches for by name. Each maps to one insight view. */
export const SEARCHABLE_FIELDS = ["complaint", "diagnosis", "medicine"] as const;
export type SearchableField = typeof SEARCHABLE_FIELDS[number];

/** Narrowings that live behind Refine rather than on the bar. */
export const REFINE_FIELDS = ["ageMin", "ageMax", "sex", "chamberId"] as const;

export const EMPTY_INSIGHT_FILTERS: InsightFilters = { period: DEFAULT_PERIOD };

export function isNarrowed(filters: InsightFilters): boolean {
    return [...SEARCHABLE_FIELDS, ...REFINE_FIELDS].some((field) => filters[field] !== undefined);
}

export function countRefinements(filters: InsightFilters): number {
    const hasAge = filters.ageMin !== undefined || filters.ageMax !== undefined;
    return (hasAge ? 1 : 0) + (filters.sex ? 1 : 0) + (filters.chamberId ? 1 : 0);
}

export function clearNarrowing(filters: InsightFilters): InsightFilters {
    return { period: filters.period };
}

export function toQueryParams(filters: InsightFilters): Record<string, string> {
    const params: Record<string, string> = {};
    const from = periodStart(filters.period);
    if (from) params.from_date = from;

    const named: Record<string, string | number | undefined> = {
        complaint:  filters.complaint,
        diagnosis:  filters.diagnosis,
        medicine:   filters.medicine,
        age_min:    filters.ageMin,
        age_max:    filters.ageMax,
        sex:        filters.sex,
        chamber_id: filters.chamberId,
    };
    for (const [name, value] of Object.entries(named)) {
        if (value !== undefined && value !== "") params[name] = String(value);
    }
    return params;
}
