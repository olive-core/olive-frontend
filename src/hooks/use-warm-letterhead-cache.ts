import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import { listChambers } from "@/lib/attendant-queue";
import { useAuthStore } from "@/stores/auth-store";

// The default 5-minute gcTime would silently evict the warmed data mid-visit, since
// nothing subscribes to these queries while the consultation runs. Must outlast the
// longest plausible consultation.
const LETTERHEAD_CACHE_TIME_MS = 1000 * 60 * 120;

/**
 * Warms the three queries the prescribe screen's letterhead composes from
 * (`useComposeLetterhead`), so it renders on the first frame instead of waiting on
 * cold fetches after the consultation ends. Runs while the consultation is still
 * going — the letterhead has no dependency on how the conversation unfolds.
 */
export function useWarmLetterheadCache(sessionId: string) {
    const queryClient = useQueryClient();
    const { userId } = useAuthStore();

    useEffect(() => {
        if (!userId) return;

        void queryClient.prefetchQuery({
            queryKey: ["clinician", userId],
            queryFn: async () => (await api.get(`/clinician/${userId}`)).data,
            gcTime: LETTERHEAD_CACHE_TIME_MS,
        });
        void queryClient.prefetchQuery({
            queryKey: ["chambers"],
            queryFn: listChambers,
            gcTime: LETTERHEAD_CACHE_TIME_MS,
        });
        void queryClient.prefetchQuery({
            queryKey: ["session", sessionId],
            queryFn: async () => (await api.get(`/session/${sessionId}`)).data,
            gcTime: LETTERHEAD_CACHE_TIME_MS,
        });
    }, [queryClient, userId, sessionId]);
}
