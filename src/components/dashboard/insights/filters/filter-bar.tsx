import { useId, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import type { InsightFilterOptions } from "@/types/insights";
import ActiveFilters from "./active-filters";
import PeriodTabs from "./period-tabs";
import RefinePanel from "./refine-panel";
import ScopeSearch from "./scope-search";
import { clearNarrowing, type InsightFilters } from "./insight-filters";

interface FilterBarProps {
    filters:  InsightFilters;
    onChange: (filters: InsightFilters) => void;
    options?: InsightFilterOptions;
}

export default function FilterBar({ filters, onChange, options }: FilterBarProps) {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const panelId = useId();
    const patch = (change: Partial<InsightFilters>) => onChange({ ...filters, ...change });

    return (
        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
            <PeriodTabs value={filters.period} onChange={(period) => patch({ period })} />
            <button type="button" aria-expanded={filtersOpen} aria-controls={panelId} onClick={() => setFiltersOpen(!filtersOpen)} className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 text-sm text-slate-600 sm:hidden">Filter patients<ChevronDownIcon className={`size-4 transition-transform motion-reduce:transition-none ${filtersOpen ? 'rotate-180' : ''}`} /></button>
            <div id={panelId} className={`${filtersOpen ? 'flex' : 'hidden'} mt-3 flex-col gap-2 sm:flex sm:flex-row`}>
                <div className="min-w-0 flex-1">
                    <ScopeSearch options={options} onPick={(field, key) => patch({ [field]: key })} />
                </div>
                <RefinePanel filters={filters} chambers={options?.chambers ?? []} onChange={patch} />
            </div>

            <div className="mt-3 empty:mt-0">
                <ActiveFilters
                    filters={filters}
                    options={options}
                    onChange={patch}
                    onClear={() => onChange(clearNarrowing(filters))}
                />
            </div>
        </section>
    );
}
