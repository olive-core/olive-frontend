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

export function eligibleFollowUpSources(
    consultations: PatientPrescriptionListItem[],
): FollowUpSource[] {
    return consultations.filter(
        (consultation) => !!consultation.session_id && !consultation.has_follow_up,
    ) as FollowUpSource[];
}
