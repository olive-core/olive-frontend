import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import { handleError } from "@/lib/utils";
import { getSubscriptionStatusFromError, isSubscriptionBlocked } from "@/lib/subscription";
import { useSubscriptionGate } from "@/stores/subscription-gate-store";
import { useDefaultChamberId } from "@/stores/active-chamber-store";
import { useAuthStore } from "@/stores/auth-store";
import { useGraceGuard } from "@/hooks/use-grace-guard";
import { useConsultationStartGuard } from "@/hooks/use-consultation-start-guard";

// Starting a consultation is metered, chamber-aware and grace-guarded. Both the
// single-patient card and the multi-patient picker start one, so the flow lives here.
export function useStartConsultation() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userId: clinicianId } = useAuthStore();
    const defaultChamberId = useDefaultChamberId(clinicianId);
    const showSubscriptionGate = useSubscriptionGate((s) => s.show);
    const { guardStart, dialog: graceDialog } = useGraceGuard();
    const canStartConsultation = useConsultationStartGuard();
    const [startingId, setStartingId] = useState<string | null>(null);
    const [startingSourceSessionId, setStartingSourceSessionId] = useState<string | null>(null);

    // contactPhone is the number that brought the patient in for this visit (already
    // in +88… form); it decides where the finished prescription is texted.
    const start = (
        patientId: string,
        contactPhone?: string,
        followUpOfSessionId?: string,
    ) => {
        if (!canStartConsultation()) return;
        return guardStart(async () => {
            try {
                setStartingId(patientId);
                setStartingSourceSessionId(followUpOfSessionId ?? null);
                const response = await api.post("/session", {
                    patient_id: patientId,
                    clinician_id: clinicianId,
                    ...(defaultChamberId ? { chamber_id: defaultChamberId } : {}),
                    ...(contactPhone ? { contact_phone: contactPhone } : {}),
                    ...(followUpOfSessionId
                        ? { follow_up_of_session_id: followUpOfSessionId }
                        : {}),
                });
                queryClient.invalidateQueries({ queryKey: ["subscription"] });
                queryClient.invalidateQueries({ queryKey: ["patient-consultations", patientId] });
                queryClient.invalidateQueries({ queryKey: ["clinician-consultations"] });
                navigate({
                    to: "/doctor/consultation/$userId/$consultationId",
                    params: { userId: patientId, consultationId: response.data.session_id },
                });
            } catch (error) {
                if (followUpOfSessionId) {
                    queryClient.invalidateQueries({ queryKey: ["patient-consultations", patientId] });
                    queryClient.invalidateQueries({ queryKey: ["clinician-consultations"] });
                }
                if (isSubscriptionBlocked(error)) {
                    showSubscriptionGate(getSubscriptionStatusFromError(error));
                    return;
                }
                handleError(error, "An error occurred while starting the consultation.");
            } finally {
                setStartingId(null);
                setStartingSourceSessionId(null);
            }
        });
    };

    return { start, startingId, startingSourceSessionId, graceDialog };
}
