import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ClinicianConsultationItem } from "@/types/consultation";
import type { DateRange } from "./filters/date-range";

interface UseClinicianConsultationsArgs {
    clinicianId?: string;
    dateRange:    DateRange;
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
            const response = await api.get(`/prescription/clinician/${clinicianId}`, {
                params: buildQueryParams(dateRange),
            });
            return response.data;
        },
        enabled: !!clinicianId,
    });
}
