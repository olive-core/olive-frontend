import BarList from "./bar-list";
import InsightCard from "./insight-card";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { percent, plural } from "./format";
import type { InsightFilters } from "./filters/insight-filters";
import { useFilterOptions, useProtocol } from "./use-insights";

const SUGGESTED_DIAGNOSES = 8;

function Figure({ value, label, caption }: { value: string; label: string; caption?: string }) {
    return (
        <div>
            <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
            {caption && <p className="text-xs text-slate-500">{caption}</p>}
        </div>
    );
}

/** This screen needs a diagnosis to read. Rather than an empty page, it offers the
 *  ones the doctor actually records. */
function DiagnosisChooser({ onPick }: { onPick: (key: string) => void }) {
    const { data } = useFilterOptions();
    const diagnoses = (data?.diagnoses ?? []).slice(0, SUGGESTED_DIAGNOSES);

    if (diagnoses.length === 0) {
        return <InsightEmpty>No diagnoses recorded yet.</InsightEmpty>;
    }

    return (
        <div>
            <p className="mb-3 text-sm text-slate-600">Pick a diagnosis to see how you treat it.</p>
            <ul className="flex flex-wrap gap-2">
                {diagnoses.map((diagnosis) => (
                    <li key={diagnosis.key}>
                        <button
                            type="button"
                            onClick={() => onPick(diagnosis.key)}
                            className="flex items-center gap-2 rounded-full bg-slate-50 py-2 pl-3.5 pr-2.5 text-sm text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"
                        >
                            <span className="max-w-[14rem] truncate">{diagnosis.label}</span>
                            <span className="text-xs tabular-nums text-slate-500">{diagnosis.count}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

interface ProtocolCardProps {
    filters: InsightFilters;
    onPick:  (diagnosis: string) => void;
}

export default function ProtocolCard({ filters, onPick }: ProtocolCardProps) {
    const { data, isLoading, isError } = useProtocol(filters);
    const hasProtocol = Boolean(data && data.consultation_count > 0);

    return (
        <InsightCard
            title="Your own protocol"
            lead={hasProtocol && data && (
                <>
                    <span className="font-semibold text-slate-900">{data.diagnosis}</span> — {data.patient_count}{" "}
                    {plural(data.patient_count, "patient")} across {data.consultation_count}{" "}
                    {plural(data.consultation_count, "visit")}.
                </>
            )}
            example="What do I actually give for this"
            note={hasProtocol && "Laid out like this, consistency and gaps both show."}
        >
            {!filters.diagnosis && <DiagnosisChooser onPick={onPick} />}

            {filters.diagnosis && isLoading && <InsightSkeleton />}
            {filters.diagnosis && isError && <InsightError />}
            {data && filters.diagnosis && data.consultation_count === 0 && (
                <InsightEmpty>No consultations carry this diagnosis yet.</InsightEmpty>
            )}

            {hasProtocol && data && (
                <div className="space-y-7">
                    <div className="grid gap-7 sm:grid-cols-2">
                        <div>
                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Medicines</p>
                            <BarList rows={data.medicines} scaleTo={data.consultation_count} emptyText="No medicines recorded." />
                        </div>
                        <div>
                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Investigations</p>
                            <BarList rows={data.investigations} scaleTo={data.consultation_count} emptyText="No investigations ordered." />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-slate-100 pt-5">
                        {data.medicines_per_consultation !== null && (
                            <Figure
                                value={String(data.medicines_per_consultation)}
                                label="medicines per prescription"
                                caption={
                                    data.practice_average_medicines !== null
                                        ? `${data.practice_average_medicines} across your whole practice`
                                        : undefined
                                }
                            />
                        )}
                        {data.return_rate !== null && (
                            <Figure value={percent(data.return_rate)} label="came back when asked" />
                        )}
                    </div>
                </div>
            )}
        </InsightCard>
    );
}
