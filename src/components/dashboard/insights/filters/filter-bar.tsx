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
    const patch = (change: Partial<InsightFilters>) => onChange({ ...filters, ...change });

    return (
        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
            <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                    <ScopeSearch options={options} onPick={(field, key) => patch({ [field]: key })} />
                </div>
                <RefinePanel filters={filters} chambers={options?.chambers ?? []} onChange={patch} />
            </div>

            <div className="mt-3">
                <PeriodTabs value={filters.period} onChange={(period) => patch({ period })} />
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
