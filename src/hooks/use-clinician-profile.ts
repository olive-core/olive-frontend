import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

export interface ClinicianProfileSettings {
    generate_ai_draft?:        boolean;
    prescription_enabled?:     boolean;
    prescription_sms_enabled?: boolean;
}

// The signed-in doctor's profile, on the same query key the profile page and letterhead
// composition already use — so a setting saved anywhere refreshes everywhere.
export function useClinicianProfile() {
    const userId = useAuthStore((state) => state.userId);

    return useQuery<ClinicianProfileSettings & Record<string, unknown>>({
        queryKey: ["clinician", userId],
        queryFn:  async () => (await api.get(`/clinician/${userId}`)).data,
        enabled:  !!userId,
    });
}
