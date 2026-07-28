import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ConsultationSettingKey } from "@/components/clinician/consultation-settings";

interface SettingChange {
    key:     ConsultationSettingKey;
    enabled: boolean;
    /** Collected by the disable dialog; logged server-side, never stored on the profile. */
    reason?: string;
}

// Persists a single consultation setting and keeps the auth store in sync, so the
// prescribe screen reads the new mode without a reload.
export function useUpdateConsultationSetting() {
    const userId = useAuthStore((state) => state.userId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ key, enabled, reason }: SettingChange) => {
            await api.put(`/clinician/${userId}`, { [key]: enabled, disable_reason: reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clinician", userId] });
            toast.success("Setting updated");
        },
        onError: () => toast.error("Could not update the setting"),
    });
}
