import { useState } from "react";
import { Button } from "@/components/ui/button";
import AgeColumns from "./age-columns";
import InsightCard from "./insight-card";
import MatchedConsultations from "./matched-consultations";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { percent } from "./format";
import type { LabelCount } from "@/types/insights";
import type { InsightFilters } from "./filters/insight-filters";
import { useOverview } from "./use-insights";

// Distinct hues, not a ramp: sex has no order, and the emerald ramp already means age.
const SEX_TONES = ["bg-emerald-600", "bg-sky-500", "bg-slate-300"];

function SexSplit({ rows }: { rows: LabelCount[] }) {
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    if (total === 0) return null;

    return (
        <div>
            <span className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                {rows.map((row, index) => (
                    <span
                        key={row.label}
                        className={`${SEX_TONES[index % SEX_TONES.length]} transition-[width] duration-500 ease-out`}
                        style={{ width: `${(row.count / total) * 100}%` }}
                    />
                ))}
            </span>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                {rows.map((row, index) => (
                    <li key={row.label} className="flex items-center gap-2 text-sm">
                        <span className={`size-2.5 rounded-sm ${SEX_TONES[index % SEX_TONES.length]}`} />
                        <span className="text-slate-600">{row.label}</span>
                        <span className="font-semibold tabular-nums text-slate-900">{row.count}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function shapeOf(data: { age_bands: LabelCount[]; sex_counts: LabelCount[] }): string | null {
    const widest = [...data.age_bands].sort((left, right) => right.count - left.count)[0];
    const people = data.sex_counts.reduce((sum, row) => sum + row.count, 0);
    const leadingSex = [...data.sex_counts].sort((left, right) => right.count - left.count)[0];
    if (!widest || widest.count === 0) return null;
    const sex = leadingSex && people > 0 ? `, ${percent(leadingSex.count / people)} ${leadingSex.label.toLowerCase()}` : "";
    return `Mostly ${widest.label} year olds${sex}.`;
}

export default function OverviewCard({ filters }: { filters: InsightFilters }) {
    const { data, isLoading, isError } = useOverview(filters);
    const [listOpen, setListOpen] = useState(false);
    const hasVisits = Boolean(data && data.consultation_count > 0);

    return (
        <InsightCard
            title="By age and sex"
            lead={hasVisits && data && shapeOf(data)}
            example="Who is actually walking into my chamber"
            action={
                hasVisits && (
                    <Button variant="outline" size="sm" className="h-10 rounded-lg" onClick={() => setListOpen(!listOpen)}>
                        {listOpen ? "Hide names" : "See names"}
                    </Button>
                )
            }
            note={data?.peak_month && `Busiest in ${data.peak_month.label}, with ${data.peak_month.count} visits.`}
        >
            {isLoading && <InsightSkeleton />}
            {isError && <InsightError />}
            {data && !hasVisits && <InsightEmpty>Nothing matches this filter yet.</InsightEmpty>}

            {hasVisits && data && (
                <div className="space-y-7">
                    <div>
                        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Age, by visit</p>
                        <AgeColumns bands={data.age_bands} />
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Sex, by visit</p>
                        <SexSplit rows={data.sex_counts} />
                    </div>

                    {listOpen && (
                        <div className="border-t border-slate-100 pt-2">
                            <MatchedConsultations filters={filters} />
                        </div>
                    )}
                </div>
            )}
        </InsightCard>
    );
}
