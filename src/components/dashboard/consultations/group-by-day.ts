import type { ClinicianConsultationItem } from "@/types/consultation";
import { getDayKey } from "./helpers";

export type ConsultationDayGroup = {
    isoDate:       string;
    consultations: ClinicianConsultationItem[];
}

export function groupConsultationsByDay(
    consultations: ClinicianConsultationItem[],
): ConsultationDayGroup[] {

    const dayMap = new Map<string, ClinicianConsultationItem[]>();

    for (const consultation of consultations) {
        const dayKey = getDayKey(consultation.created_at);
        const bucket = dayMap.get(dayKey) ?? [];
        bucket.push(consultation);
        dayMap.set(dayKey, bucket);
    }

    return Array.from(dayMap.entries())
        .map(([isoDate, items]) => ({ isoDate, consultations: items }))
        .sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}
