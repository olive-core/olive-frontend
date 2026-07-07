import type { QueryClient } from "@tanstack/react-query";
import type { QueueEntry } from "@/types/attendant-queue";

/**
 * Reorders the cached queue immediately so the cards move the instant an arrow is
 * tapped, then hands back a rollback for the mutation's error path. The server
 * response (and SSE) reconcile afterwards. `in_room` stays pinned to the top,
 * matching the server's ordering.
 */
export async function applyOptimisticReorder(
    queryClient: QueryClient,
    chamberId: string | null,
    orderedWaitingIds: string[],
) {
    const key = ["queue", chamberId];
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<QueueEntry[]>(key);

    if (previous) {
        const byId = new Map(previous.map((entry) => [entry.queue_entry_id, entry]));
        const inside = previous.filter((entry) => entry.status === "in_room");
        const reordered = orderedWaitingIds
            .map((id, index) => {
                const entry = byId.get(id);
                return entry ? { ...entry, position: index + 1 } : null;
            })
            .filter((entry): entry is QueueEntry => entry !== null);
        queryClient.setQueryData<QueueEntry[]>(key, [...inside, ...reordered]);
    }

    return {
        rollback: () => {
            if (previous) queryClient.setQueryData(key, previous);
        },
    };
}
