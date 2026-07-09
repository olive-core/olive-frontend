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

// Starting a consultation is metered, chamber-aware and grace-guarded. Both the
// single-patient card and the multi-patient picker start one, so the flow lives here.
export function useStartConsultation() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userId: clinicianId } = useAuthStore();
    const defaultChamberId = useDefaultChamberId(clinicianId);
    const showSubscriptionGate = useSubscriptionGate((s) => s.show);
    const { guardStart, dialog: graceDialog } = useGraceGuard();
    const [startingId, setStartingId] = useState<string | null>(null);

    // contactPhone is the number that brought the patient in for this visit (already
    // in +88… form); it decides where the finished prescription is texted.
    const start = (patientId: string, contactPhone?: string) =>
        guardStart(async () => {
            try {
                setStartingId(patientId);
                const response = await api.post("/session", {
                    patient_id: patientId,
                    clinician_id: clinicianId,
                    ...(defaultChamberId ? { chamber_id: defaultChamberId } : {}),
                    ...(contactPhone ? { contact_phone: contactPhone } : {}),
                });
                queryClient.invalidateQueries({ queryKey: ["subscription"] });
                navigate({
                    to: "/doctor/consultation/$userId/$consultationId",
                    params: { userId: patientId, consultationId: response.data.session_id },
                });
            } catch (error) {
                if (isSubscriptionBlocked(error)) {
                    showSubscriptionGate(getSubscriptionStatusFromError(error));
                    return;
                }
                handleError(error, "An error occurred while starting the consultation.");
            } finally {
                setStartingId(null);
            }
        });

    return { start, startingId, graceDialog };
}
