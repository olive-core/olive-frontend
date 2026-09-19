import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import InsightCard from "./insight-card";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { percent, plural } from "./format";
import type { ComplaintTrend, TrendDirection } from "@/types/insights";
import type { InsightFilters } from "./filters/insight-filters";
import type { DrillDown } from "./questions";
import { useTrends } from "./use-insights";

const DIRECTIONS: Record<TrendDirection, { icon: typeof MinusIcon; change: string; text: string }> = {
    rising:  { icon: ArrowUpRightIcon,   change: "bg-orange-500", text: "text-orange-600" },
    falling: { icon: ArrowDownRightIcon, change: "bg-blue-600",   text: "text-blue-700" },
    steady:  { icon: MinusIcon,          change: "bg-slate-400",  text: "text-slate-500" },
};

/** The bar is in two parts: the usual month in grey, and the difference against it in
 *  colour. Colouring the whole bar would let a long "steady" row out-run a short
 *  "rising" one, because length is a share and colour is a comparison. */
function TrendRow({ trend, scale, onOpen }: { trend: ComplaintTrend; scale: number; onOpen: () => void }) {
    const direction = DIRECTIONS[trend.direction];
    const Icon = direction.icon;
    const shared = Math.min(trend.current_share, trend.baseline_share);
    const change = Math.abs(trend.current_share - trend.baseline_share);

    return (
        <li>
            <button
                type="button"
                onClick={onOpen}
                className="w-full rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
                <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-800">{trend.label}</span>
                    <span className={`flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums ${direction.text}`}>
                        <span className="text-slate-500">{percent(trend.baseline_share)}</span>
                        <Icon className="size-3.5" />
                        <span className="font-semibold">{percent(trend.current_share)}</span>
                    </span>
                </div>
                <span className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                        className="block bg-slate-300 transition-[width] duration-500 ease-out"
                        style={{ width: `${(shared / scale) * 100}%` }}
                    />
                    <span
                        className={`block transition-[width] duration-500 ease-out ${direction.change}`}
                        style={{ width: `${(change / scale) * 100}%` }}
                    />
                </span>
            </button>
        </li>
    );
}

export default function RisingCard({ filters, onDrill }: { filters: InsightFilters; onDrill: DrillDown }) {
    const { data, isLoading, isError } = useTrends(filters);
    const scale = Math.max(...(data?.complaints ?? []).flatMap((t) => [t.current_share, t.baseline_share]), 0.01);
    const ready = Boolean(data?.has_enough_history);
    // Rows arrive ordered by how far they moved, so the first one that moved is the finding.
    const headline = data?.complaints.find((trend) => trend.direction !== "steady");

    return (
        <InsightCard
            title="This month against your usual"
            lead={ready && data && (
                headline
                    ? <>
                        In {data.period_label}, <span className="font-semibold text-slate-900">{headline.label}</span> is
                        running at <span className="font-semibold text-slate-900">{percent(headline.current_share)}</span> of
                        visits, against your usual {percent(headline.baseline_share)}.
                      </>
                    : `${data.period_label} · ${data.period_count} ${plural(data.period_count, "consultation")}`
            )}
            example="Is there really more fever around than usual"
            note={
                ready && data
                    ? `Grey is your usual month across the previous ${data.baseline_months} ${plural(data.baseline_months, "month")}; the coloured part is the difference this month.`
                    : "A running baseline needs a few months behind it. After a year this same view becomes a real seasonal curve."
            }
        >
            {isLoading && <InsightSkeleton rows={4} />}
            {isError && <InsightError />}

            {data && !ready && (
                <InsightEmpty>
                    Only {data.baseline_months} {plural(data.baseline_months, "month")} of history so far.
                    Not enough to call anything unusual yet.
                </InsightEmpty>
            )}

            {ready && data && data.complaints.length === 0 && (
                <InsightEmpty>Nothing has moved much against your usual month.</InsightEmpty>
            )}

            {ready && data && data.complaints.length > 0 && (
                <ul className="-mx-2 space-y-1">
                    {data.complaints.map((trend) => (
                        <TrendRow
                            key={trend.key}
                            trend={trend}
                            scale={scale}
                            onOpen={() => onDrill({ complaint: trend.key }, "diagnosis")}
                        />
                    ))}
                </ul>
            )}
        </InsightCard>
    );
}
