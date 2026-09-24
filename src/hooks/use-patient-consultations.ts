import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { PatientPrescriptionListItem } from "@/types/patient";

export type FollowUpSource = PatientPrescriptionListItem & { session_id: string };

export function usePatientConsultations(patientId?: string) {
    return useQuery<PatientPrescriptionListItem[]>({
        queryKey: ["patient-consultations", patientId],
        queryFn: async () => {
            const response = await api.get(`/prescription/patient/${patientId}`);
            return response.data;
        },
        enabled: !!patientId,
    });
}

// General history access does not grant permission to continue a case.
// The author fallback supports deployment against the previous API.
export function eligibleFollowUpSources(
    consultations: PatientPrescriptionListItem[],
    clinicianId: string | undefined,
): FollowUpSource[] {
    return consultations.filter(
        (consultation) =>
            !!consultation.session_id &&
            !consultation.has_follow_up &&
            (consultation.can_follow_up ?? (!!clinicianId && consultation.clinician_id === clinicianId)),
    ) as FollowUpSource[];
}
