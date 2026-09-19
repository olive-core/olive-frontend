import { XIcon } from "lucide-react";
import type { InsightFilterOptions } from "@/types/insights";
import { SEARCHABLE_FIELDS, type InsightFilters, type SearchableField } from "./insight-filters";

type NamedSource = "complaints" | "diagnoses" | "medicines";

const OPTION_SOURCE: Record<SearchableField, NamedSource> = {
    complaint: "complaints",
    diagnosis: "diagnoses",
    medicine:  "medicines",
};

type Chip = { id: string; label: string; clear: Partial<InsightFilters> };

function ageLabel({ ageMin, ageMax }: InsightFilters): string {
    if (ageMin !== undefined && ageMax !== undefined) return `${ageMin}–${ageMax} yrs`;
    return ageMin !== undefined ? `${ageMin}+ yrs` : `under ${ageMax! + 1}`;
}

function buildChips(filters: InsightFilters, options?: InsightFilterOptions): Chip[] {
    const chips: Chip[] = [];

    for (const field of SEARCHABLE_FIELDS) {
        const key = filters[field];
        if (!key) continue;
        const known = options?.[OPTION_SOURCE[field]]?.find((row) => row.key === key);
        chips.push({ id: field, label: known?.label ?? key, clear: { [field]: undefined } });
    }
    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
        chips.push({ id: "age", label: ageLabel(filters), clear: { ageMin: undefined, ageMax: undefined } });
    }
    if (filters.sex) {
        chips.push({ id: "sex", label: filters.sex === "male" ? "Male" : "Female", clear: { sex: undefined } });
    }
    if (filters.chamberId) {
        const chamber = options?.chambers.find((row) => row.chamber_id === filters.chamberId);
        chips.push({ id: "chamber", label: chamber?.label ?? "Chamber", clear: { chamberId: undefined } });
    }
    return chips;
}

interface ActiveFiltersProps {
    filters:  InsightFilters;
    options?: InsightFilterOptions;
    onChange: (patch: Partial<InsightFilters>) => void;
    onClear:  () => void;
}

export default function ActiveFilters({ filters, options, onChange, onClear }: ActiveFiltersProps) {
    const chips = buildChips(filters, options);
    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <button
                    key={chip.id}
                    type="button"
                    onClick={() => onChange(chip.clear)}
                    className="group inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full bg-emerald-700 py-1.5 pl-3.5 pr-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
                >
                    <span className="truncate">{chip.label}</span>
                    <XIcon className="size-4 shrink-0 opacity-70 group-hover:opacity-100" />
                </button>
            ))}
            {chips.length > 1 && (
                <button type="button" onClick={onClear} className="min-h-9 px-2 text-sm text-slate-500 underline-offset-2 hover:underline">
                    Clear all
                </button>
            )}
        </div>
    );
}
