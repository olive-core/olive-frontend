import BarList from "./bar-list";
import InsightCard from "./insight-card";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { plural } from "./format";
import type { InsightFilters } from "./filters/insight-filters";
import type { DrillDown } from "./questions";
import { useComplaintDiagnosis } from "./use-insights";

const OTHER_ROW_LABEL = "Everything else";

interface ComplaintDiagnosisCardProps {
    filters: InsightFilters;
    onDrill: DrillDown;
}

export default function ComplaintDiagnosisCard({ filters, onDrill }: ComplaintDiagnosisCardProps) {
    const { data, isLoading, isError } = useComplaintDiagnosis(filters);
    const leader = data?.diagnoses[0];

    const rows = data
        ? [
            ...data.diagnoses.map((diagnosis) => ({ key: diagnosis.key, label: diagnosis.label, count: diagnosis.count })),
            ...(data.other_count > 0 ? [{ label: OTHER_ROW_LABEL, count: data.other_count, residual: true }] : []),
        ]
        : [];

    return (
        <InsightCard
            title="Complaint to diagnosis"
            lead={
                data?.complaint && (
                    <>
                        Of {data.consultation_count} {plural(data.consultation_count, "patient")} presenting with{" "}
                        <span className="font-semibold text-slate-900">{data.complaint}</span>
                        {leader && <>, <span className="font-semibold text-slate-900">{leader.label}</span> was commonest at {leader.count}</>}.
                    </>
                )
            }
            example="When someone comes with fever, what does it turn out to be"
            note="Tap a diagnosis to see how you treat it. A visit can carry more than one diagnosis, so these do not add up to the total."
        >
            {isLoading && <InsightSkeleton />}
            {isError && <InsightError />}
            {data && !data.complaint && (
                <InsightEmpty>No complaints recorded for this filter yet.</InsightEmpty>
            )}

            {data?.complaint && (
                <BarList
                    rows={rows}
                    scaleTo={data.consultation_count}
                    onPick={(key) => onDrill({ diagnosis: key }, "protocol")}
                    emptyText="No diagnosis recorded on these consultations."
                />
            )}
        </InsightCard>
    );
}
