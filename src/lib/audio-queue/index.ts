// The audio queue: every captured chunk is written to the device first, and the network
// catches up on its own time. Nothing outside this folder needs to know how.

export { enqueueChunk, isQueueDurable, sessionChunks, tallyChunks } from "./chunk-store";
export type { ChunkState, ChunkTally, QueuedChunk } from "./chunk-store";

export { unsentChunkCount, waitForDelivery } from "./delivery";
export type { DeliveryWait } from "./delivery";

export {
    nudgeDrainer,
    queueStatus,
    setDrainUrgency,
    startDrainer,
    stopDrainer,
    subscribeToQueueStatus,
} from "./drainer";
export type { QueueHealth, QueueStatus } from "./drainer";

export {
    clearSyncedSessionChunks,
    forgetDiscardedSession,
    hasRoomToRecord,
    requestPersistentStorage,
    sweepSyncedChunks,
} from "./storage-lifecycle";
