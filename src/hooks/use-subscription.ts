import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import type { PaymentClaim, SubscriptionStatus } from "@/types/subscription";

export function useSubscriptionStatus() {
    const userId = useAuthStore((s) => s.userId);

    return useQuery({
        queryKey: ["subscription", userId],
        enabled: Boolean(userId),
        queryFn: async () => {
            const res = await api.get<SubscriptionStatus>(`/subscription/${userId}`);
            return res.data;
        },
    });
}

export function useSubmitPaymentClaim() {
    const userId = useAuthStore((s) => s.userId);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (claim: PaymentClaim) => {
            const res = await api.post(`/subscription/${userId}/claim`, claim);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription", userId] });
        },
    });
}
