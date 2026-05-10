import type { ClinicianConsultationItem } from "@/types/consultation";
import { getFullName } from "../helpers";

export function filterConsultationsByName(
    consultations: ClinicianConsultationItem[],
    searchTerm: string,
): ClinicianConsultationItem[] {

    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return consultations;

    return consultations.filter((consultation) => {
        const fullName = getFullName(
            consultation.patient_first_name,
            consultation.patient_last_name,
        ).toLowerCase();
        return fullName.includes(normalizedTerm);
    });
}
