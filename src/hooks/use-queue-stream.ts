import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

const QUEUE_EVENTS = [
    "snapshot",
    "patient_added",
    "reordered",
    "started",
    "completed",
    "removed",
];

/**
 * Subscribes to a chamber's live queue over SSE and fires `onChange` on every
 * event. The queue is tiny, so callers refetch on any change rather than
 * applying granular patches — refetch beats event replay and self-heals on
 * reconnect. Pass a stable `onChange` (useCallback) to avoid re-subscribing.
 */
export function useQueueStream(chamberId: string | undefined, onChange: () => void) {
    const token = useAuthStore((s) => s.accessToken);

    useEffect(() => {
        if (!chamberId || !token) return;

        const source = new EventSource(
            `/api/v1/queue/chamber/${chamberId}/stream?token=${encodeURIComponent(token)}`
        );
        QUEUE_EVENTS.forEach((event) => source.addEventListener(event, onChange));

        return () => source.close();
    }, [chamberId, token, onChange]);
}
