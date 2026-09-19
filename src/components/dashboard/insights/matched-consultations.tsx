import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import api from "@/lib/axios";
import type { ClinicianConsultationItem } from "@/types/consultation";
import PatientAvatar from "@/components/dashboard/consultations/patient-avatar";
import SexAgeMeta from "@/components/dashboard/consultations/sex-age-meta";
import DiagnosisPills from "@/components/dashboard/consultations/diagnosis-pills";
import { getFullName } from "@/components/dashboard/consultations/helpers";
import { toQueryParams, type InsightFilters } from "./filters/insight-filters";
import { InsightEmpty, InsightError, InsightSkeleton } from "./insight-states";

const PAGE_SIZE = 30;

function useMatchedConsultations(filters: InsightFilters) {
    const params = { ...toQueryParams(filters), limit: String(PAGE_SIZE) };
    return useQuery<ClinicianConsultationItem[]>({
        queryKey: ["insights", "consultations", params],
        queryFn:  async () => (await api.get<ClinicianConsultationItem[]>("/insights/consultations", { params })).data,
    });
}

export default function MatchedConsultations({ filters }: { filters: InsightFilters }) {
    const { data, isLoading, isError } = useMatchedConsultations(filters);

    if (isLoading) return <InsightSkeleton rows={3} />;
    if (isError)   return <InsightError />;
    if (!data?.length) return <InsightEmpty>No consultations match this filter.</InsightEmpty>;

    return (
        <ul className="divide-y divide-slate-100">
            {data.map((consultation) => (
                <li key={consultation.prescription_id}>
                    <Link
                        to="/doctor/consultations/$prescriptionId"
                        params={{ prescriptionId: consultation.prescription_id }}
                        search={{ document: undefined }}
                        className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50"
                    >
                        <PatientAvatar
                            name={consultation.patient_name}
                            sex={consultation.patient_sex}
                            className="size-9 text-xs"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                                {getFullName(consultation.patient_name)}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2">
                                <SexAgeMeta
                                    sex={consultation.patient_sex}
                                    dateOfBirth={consultation.patient_date_of_birth}
                                />
                                <span className="text-xs text-slate-500">
                                    {format(new Date(consultation.created_at), "d MMM yyyy")}
                                </span>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <DiagnosisPills diagnoses={consultation.diagnoses_summary} />
                        </div>
                    </Link>
                </li>
            ))}
            {data.length === PAGE_SIZE && (
                <li className="py-3 text-xs text-slate-500">
                    Showing the {PAGE_SIZE} most recent. Narrow the filter to see the rest.
                </li>
            )}
        </ul>
    );
}
