import InsightCard from "./insight-card";
import PatientRow from "./patient-row";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";
import { plural, shareOf } from "./format";
import type { InsightFilters } from "./filters/insight-filters";
import { useEarlyReturns } from "./use-insights";

export default function EarlyReturnsCard({ filters }: { filters: InsightFilters }) {
    const { data, isLoading, isError } = useEarlyReturns(filters);

    return (
        <InsightCard
            title="Unplanned early returns"
            lead={data && data.early_return_count > 0 && (
                <>
                    <span className="font-semibold text-slate-900">{data.early_return_count}</span>{" "}
                    {plural(data.early_return_count, "patient")} came back inside {data.window_days} days with the same
                    complaint, sooner than you asked
                    {data.top_complaint && <>, most often {data.top_complaint.label}</>}.
                </>
            )}
            example="Which patients came back because it did not work"
            note={data && data.early_return_count > 0 &&
                `That is ${shareOf(data.early_return_count, data.consultation_count)} of visits in this period.`}
        >
            {isLoading && <InsightSkeleton rows={3} />}
            {isError && <InsightError />}
            {data && data.early_return_count === 0 && (
                <InsightEmpty>No unplanned early returns in this period.</InsightEmpty>
            )}

            {data && data.early_return_count > 0 && (
                <ul className="-mx-2 divide-y divide-slate-100">
                    {data.returns.map((patient) => (
                        <li key={patient.prescription_id}>
                            <PatientRow
                                prescriptionId={patient.prescription_id}
                                name={patient.patient_name}
                                detail={patient.complaint + (patient.patient_age !== null ? ` · ${patient.patient_age}y` : "")}
                                trailing={`back in ${patient.days_between} ${plural(patient.days_between, "day")}`}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </InsightCard>
    );
}
