import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ClinicianConsultationItem } from "@/types/consultation";
import type { DateRange } from "./filters/date-range";

interface UseClinicianConsultationsArgs {
    clinicianId?: string;
    dateRange:    DateRange;
}

export function mergeClinicianConsultations(
    owned: ClinicianConsultationItem[],
    shared: ClinicianConsultationItem[],
): ClinicianConsultationItem[] {
    return [...owned, ...shared]
        .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at));
}

function buildQueryParams(dateRange: DateRange): Record<string, string> {
    const params: Record<string, string> = {};
    if (dateRange.fromDate) params.from_date = dateRange.fromDate;
    if (dateRange.toDate)   params.to_date   = dateRange.toDate;
    return params;
}

export function useClinicianConsultations({ clinicianId, dateRange }: UseClinicianConsultationsArgs) {
    return useQuery<ClinicianConsultationItem[]>({
        queryKey: ['clinician-consultations', clinicianId, dateRange.fromDate, dateRange.toDate],
        queryFn:  async () => {
            const params = buildQueryParams(dateRange);
            const [owned, shared] = await Promise.all([
                api.get<ClinicianConsultationItem[]>(`/prescription/clinician/${clinicianId}`, { params }),
                api.get<ClinicianConsultationItem[]>("/case/shared", { params }),
            ]);
            return mergeClinicianConsultations(owned.data, shared.data);
        },
        enabled: !!clinicianId,
    });
}
