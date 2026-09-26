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
    const sharedRoots = new Set(shared.map((item) => item.case_root_session_id).filter(Boolean));
    const sharedIds = new Set(shared.map((item) => item.prescription_id));
    const personal = owned.filter((item) => !sharedIds.has(item.prescription_id)
        && (!item.case_root_session_id || !sharedRoots.has(item.case_root_session_id)));
    return [...personal, ...shared]
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
            const response = await api.get<ClinicianConsultationItem[]>("/case/list", { params });
            return response.data;
        },
        enabled: !!clinicianId,
    });
}
