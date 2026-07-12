import { parseISO, subMonths, subYears } from "date-fns";
import type { PatientPrescriptionListItem } from "@/types/patient";

export type Period = 'all' | '3m' | '6m' | '1y';

export function isFiltersActive(searchTerm: string, period: Period): boolean {
    return searchTerm.trim().length > 0 || period !== 'all';
}

function clinicianFullName(item: PatientPrescriptionListItem): string {
    return (item.clinician_name ?? "").toLowerCase();
}

function matchesSearchTerm(item: PatientPrescriptionListItem, normalizedTerm: string): boolean {
    if (clinicianFullName(item).includes(normalizedTerm)) return true;
    return item.diagnoses_summary.some((d) => d.toLowerCase().includes(normalizedTerm));
}

export function filterBySearchTerm(
    items: PatientPrescriptionListItem[],
    searchTerm: string,
): PatientPrescriptionListItem[] {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return items;
    return items.filter((item) => matchesSearchTerm(item, normalizedTerm));
}

const PERIOD_CUTOFFS: Record<Exclude<Period, 'all'>, () => Date> = {
    '3m': () => subMonths(new Date(), 3),
    '6m': () => subMonths(new Date(), 6),
    '1y': () => subYears(new Date(), 1),
};

export function filterByPeriod(
    items: PatientPrescriptionListItem[],
    period: Period,
): PatientPrescriptionListItem[] {
    if (period === 'all') return items;
    const cutoff = PERIOD_CUTOFFS[period]();
    return items.filter((item) => parseISO(item.created_at) >= cutoff);
}

export function applyFilters(
    items: PatientPrescriptionListItem[],
    searchTerm: string,
    period: Period,
): PatientPrescriptionListItem[] {
    return filterByPeriod(filterBySearchTerm(items, searchTerm), period);
}
