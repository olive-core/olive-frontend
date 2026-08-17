import { useSyncExternalStore } from "react";

import { queueStatus, subscribeToQueueStatus, type QueueStatus } from "@/lib/audio-queue";

/** What the upload queue is doing right now, for any screen that should say so. */
export function useAudioQueueStatus(): QueueStatus {
    return useSyncExternalStore(subscribeToQueueStatus, queueStatus, queueStatus);
}
