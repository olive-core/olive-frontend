import { periodLabel } from "./filters/periods";
import { plural } from "./format";
import type { InsightFilters } from "./filters/insight-filters";
import { useOverview } from "./use-insights";

/** What the controls above actually selected. One quiet line: the headline belongs to
 *  the answer, not to the filter. */
export default function ScopeSummary({ filters }: { filters: InsightFilters }) {
    const { data, isLoading } = useOverview(filters);
    const show = (value?: number) => (isLoading || value === undefined ? "—" : String(value));

    return (
        <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{show(data?.patient_count)}</span>{" "}
            {plural(data?.patient_count ?? 0, "patient")}
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-semibold text-slate-900">{show(data?.consultation_count)}</span>{" "}
            {plural(data?.consultation_count ?? 0, "visit")}
            <span className="mx-1.5 text-slate-300">·</span>
            {periodLabel(filters.period).toLowerCase()}
        </p>
    );
}
