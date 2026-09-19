import { ChevronRightIcon } from "lucide-react";
import AgeBandBar, { AgeBandLegend } from "./age-band-bar";
import InsightCard from "./insight-card";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { plural } from "./format";
import type { ComplaintBreakdown } from "@/types/insights";
import type { InsightFilters } from "./filters/insight-filters";
import type { DrillDown } from "./questions";
import { useTopComplaints } from "./use-insights";

function ComplaintRow({ complaint, fill, onOpen }: { complaint: ComplaintBreakdown; fill: number; onOpen: () => void }) {
    return (
        <li>
            <button
                type="button"
                onClick={onOpen}
                className="group w-full rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
                <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1 text-sm font-medium text-slate-800">
                        <span className="truncate">{complaint.label}</span>
                        <ChevronRightIcon className="size-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600" />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-slate-900">{complaint.count}</span>
                </div>
                <div className="mt-2">
                    <AgeBandBar bands={complaint.age_bands} fill={fill} />
                </div>
                {complaint.dominant_band && (
                    <p className="mt-2 text-xs text-slate-600">
                        Mostly {complaint.dominant_band}.
                        {complaint.outlier && (
                            <span className="text-slate-800"> But {complaint.outlier.count} were {complaint.outlier.label}.</span>
                        )}
                    </p>
                )}
            </button>
        </li>
    );
}

interface TopComplaintsCardProps {
    filters: InsightFilters;
    onDrill: DrillDown;
}

export default function TopComplaintsCard({ filters, onDrill }: TopComplaintsCardProps) {
    const { data, isLoading, isError } = useTopComplaints(filters);
    const bands = data?.complaints[0]?.age_bands ?? [];
    const largest = Math.max(...(data?.complaints ?? []).map((complaint) => complaint.count), 1);
    const leader = data?.complaints[0];

    return (
        <InsightCard
            title="Top complaints, split by age"
            lead={leader && data && (
                <><span className="font-semibold text-slate-900">{leader.label}</span> leads, in {leader.count} of{" "}
                {data.consultation_count} {plural(data.consultation_count, "consultation")}.</>
            )}
            example="What do people keep coming to me with"
            note="Tap a complaint to see what it turns out to be. The age split is the part you cannot guess."
        >
            {isLoading && <InsightSkeleton rows={5} />}
            {isError && <InsightError />}
            {data && data.complaints.length === 0 && (
                <InsightEmpty>No complaints recorded for this filter yet.</InsightEmpty>
            )}

            {data && data.complaints.length > 0 && (
                <>
                    <div className="mb-4">
                        <AgeBandLegend bands={bands} />
                    </div>
                    <ul className="-mx-2 space-y-1">
                        {data.complaints.map((complaint) => (
                            <ComplaintRow
                                key={complaint.key}
                                complaint={complaint}
                                fill={complaint.count / largest}
                                onOpen={() => onDrill({ complaint: complaint.key }, "diagnosis")}
                            />
                        ))}
                    </ul>
                </>
            )}
        </InsightCard>
    );
}
