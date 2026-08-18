import type { ClinicianConsultationItem } from "@/types/consultation";
import type { CaseAccessFilter } from "./toolbar";


export function filterConsultationsByAccess(
    consultations: ClinicianConsultationItem[],
    accessFilter: CaseAccessFilter,
): ClinicianConsultationItem[] {
    if (accessFilter === "shared") {
        return consultations.filter((consultation) => consultation.access_type === "shared");
    }
    if (accessFilter === "owned") {
        return consultations.filter((consultation) => consultation.access_type !== "shared");
    }
    return consultations;
}
