import { useState } from "react";
import { format } from "date-fns";
import { ChevronRightIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsightCard from "./insight-card";
import PatientRow from "./patient-row";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { percent, plural, shareOf } from "./format";
import type { DiagnosisReturnRate, FollowUpInsight } from "@/types/insights";
import type { InsightFilters } from "./filters/insight-filters";
import type { DrillDown } from "./questions";
import { useFollowUp, useOverdueFollowUps } from "./use-insights";

// Blue / grey / orange rather than green / red: the two ends have to stay apart for
// a colour-blind reader, and every segment carries its own label anyway.
const SEGMENTS = [
    { field: "on_time",      label: "On time",      bar: "bg-blue-600",   text: "text-blue-700" },
    { field: "late",         label: "Late",         bar: "bg-slate-400",  text: "text-slate-600" },
    { field: "not_returned", label: "Not returned", bar: "bg-orange-500", text: "text-orange-600" },
] as const;

function ReturnSplit({ data }: { data: FollowUpInsight }) {
    const settled = data.on_time + data.late + data.not_returned;
    if (settled === 0) return null;

    return (
        <>
            <span className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                {SEGMENTS.map((segment) => (
                    <span
                        key={segment.field}
                        className={`${segment.bar} transition-[width] duration-500 ease-out`}
                        style={{ width: `${(data[segment.field] / settled) * 100}%` }}
                    />
                ))}
            </span>

            <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                {SEGMENTS.map((segment) => (
                    <li key={segment.field}>
                        <p className={`text-xl font-bold tabular-nums sm:text-2xl ${segment.text}`}>
                            {shareOf(data[segment.field], settled)}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
                            <span className={`size-2.5 shrink-0 rounded-sm ${segment.bar}`} />
                            {segment.label}
                        </p>
                        <p className="text-[11px] text-slate-500 sm:text-xs">
                            {data[segment.field]}
                            {segment.field === "late" && data.average_days_late !== null && ` · ${data.average_days_late}d avg`}
                        </p>
                    </li>
                ))}
            </ul>
        </>
    );
}

function ReturnRateByDiagnosis({ rows, onOpen }: { rows: DiagnosisReturnRate[]; onOpen: (key: string) => void }) {
    if (rows.length === 0) return null;

    return (
        <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Return rate by diagnosis</p>
            <ul className="-mx-2 space-y-0.5">
                {rows.map((row) => (
                    <li key={row.key}>
                        <button
                            type="button"
                            onClick={() => onOpen(row.key)}
                            className="group block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                        >
                            <span className="flex items-baseline justify-between gap-3">
                                <span className="flex min-w-0 items-center gap-1 text-sm text-slate-700">
                                    <span className="truncate">{row.label}</span>
                                    <ChevronRightIcon className="size-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600" />
                                </span>
                                <span className="whitespace-nowrap text-sm tabular-nums text-slate-900">
                                    <span className="font-semibold">{percent(row.returned / row.count)}</span>
                                    <span className="ml-1.5 text-xs text-slate-500">{row.returned} of {row.count}</span>
                                </span>
                            </span>
                            <span className="mt-1.5 block h-2 rounded-full bg-slate-100">
                                <span
                                    className="block h-2 rounded-full bg-blue-600 transition-[width] duration-500 ease-out"
                                    style={{ width: `${(row.returned / row.count) * 100}%` }}
                                />
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function OverdueCallout({ filters, count }: { filters: InsightFilters; count: number }) {
    const [open, setOpen] = useState(false);
    const { data, isLoading } = useOverdueFollowUps(filters, open);
    if (count === 0) return null;

    return (
        <div className="mt-6 rounded-xl bg-orange-50 p-4 ring-1 ring-orange-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm text-orange-900">
                    <PhoneIcon className="size-4 shrink-0" />
                    <span>
                        <span className="font-semibold">{count}</span>{" "}
                        {plural(count, "patient is", "patients are")} overdue. Your assistant can call them today.
                    </span>
                </p>
                <Button variant="outline" size="sm" className="h-10 rounded-lg bg-white" onClick={() => setOpen(!open)}>
                    {open ? "Hide" : "See names"}
                </Button>
            </div>

            {open && isLoading && <p className="mt-3 text-sm text-orange-700">Loading…</p>}
            {open && data && (
                <ul className="-mx-2 mt-2">
                    {data.map((patient) => (
                        <li key={patient.prescription_id}>
                            <PatientRow
                                prescriptionId={patient.prescription_id}
                                name={patient.patient_name}
                                detail={patient.diagnoses.join(", ")}
                                trailing={`due ${format(new Date(patient.due_date), "d MMM")} · ${patient.days_overdue}d late`}
                                tone="warning"
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function FollowUpCard({ filters, onDrill }: { filters: InsightFilters; onDrill: DrillDown }) {
    const { data, isLoading, isError } = useFollowUp(filters);
    const settled = data ? data.on_time + data.late + data.not_returned : 0;

    return (
        <InsightCard
            title="Follow-up scorecard"
            lead={data && data.asked_count > 0 && (
                <>
                    You asked <span className="font-semibold text-slate-900">{data.asked_count}</span>{" "}
                    {plural(data.asked_count, "patient")} to come back.{" "}
                    {settled > 0 && <><span className="font-semibold text-slate-900">{shareOf(data.not_returned, settled)}</span> have not.</>}
                </>
            )}
            example="Do my patients actually come back when I tell them to"
            note={data && data.consultation_count > 0 && (
                <>
                    Counted over the {data.asked_count} of {data.consultation_count}{" "}
                    {plural(data.consultation_count, "consultation")} where you set a follow-up date
                    {data.pending > 0 && <>. {data.pending} more are not due yet</>}.
                </>
            )}
        >
            {isLoading && <InsightSkeleton />}
            {isError && <InsightError />}
            {data && data.asked_count === 0 && (
                <InsightEmpty>No follow-up date was set on these consultations.</InsightEmpty>
            )}

            {data && data.asked_count > 0 && (
                <>
                    <ReturnSplit data={data} />
                    <ReturnRateByDiagnosis
                        rows={data.by_diagnosis}
                        onOpen={(key) => onDrill({ diagnosis: key }, "protocol")}
                    />
                    <OverdueCallout filters={filters} count={data.overdue_count} />
                </>
            )}
        </InsightCard>
    );
}
