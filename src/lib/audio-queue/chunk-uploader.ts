import axios, { AxiosError } from "axios";

import api from "@/lib/axios";
import type { QueuedChunk } from "./chunk-store";

// Identifies the chunking algorithm the stored chunks were captured with, so they can be
// merged into a continuous recording later. Bump the version if the algorithm changes.
const CHUNKING_SCHEME = "listen-v1";

// 401 is retryable because the axios interceptor renews the session and the next attempt
// carries a fresh token. The rest are the codes that mean "later", not "never".
const RETRYABLE_STATUSES = new Set([401, 408, 425, 429]);

export type UploadOutcome =
    /** The server holds this chunk. The local audio can go. */
    | "acked"
    /** Unknown or temporary. The chunk stays, and the queue tries again. */
    | "retry"
    /** The server will never accept it. The audio stays for export, not for retrying. */
    | "rejected";

export async function uploadChunk(chunk: QueuedChunk): Promise<UploadOutcome> {
    if (!chunk.blob) return "acked";

    try {
        const { data } = await api.post("/conversation/chunk", chunkFormData(chunk));
        return outcomeFromBody(data);
    } catch (error) {
        return outcomeFromError(error);
    }
}

function chunkFormData(chunk: QueuedChunk): FormData {
    const formData = new FormData();
    formData.append("file", chunk.blob!, chunkFileName(chunk));
    formData.append("session_id", chunk.sessionId);
    formData.append("chunk_index", String(chunk.chunkIndex));
    formData.append("chunking_scheme", CHUNKING_SCHEME);
    formData.append("chunk_size_ms", String(chunk.chunkSizeMs));
    formData.append("overlap_ms", String(chunk.overlapMs));
    return formData;
}

function chunkFileName({ chunkIndex, mimeType }: QueuedChunk): string {
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    return `chunk-${chunkIndex}.${extension}`;
}

// A captive portal answers every request with 200 and an HTML login page, so a status
// code alone cannot confirm delivery. Only a body the API could have produced counts.
function outcomeFromBody(data: unknown): UploadOutcome {
    const status = (data as { status?: unknown } | null)?.status;
    if (typeof status !== "string") return "retry";
    return status === "in_progress" ? "retry" : "acked";
}

function outcomeFromError(error: unknown): UploadOutcome {
    if (!axios.isAxiosError(error)) {
        // Not a request failure at all, so retrying will keep failing the same way. The
        // audio is still kept, but this needs to be visible rather than a silent loop.
        console.error("[audio-queue] chunk upload raised a non-network error:", error);
        return "retry";
    }

    const status = (error as AxiosError).response?.status;
    if (status === undefined) return "retry";
    if (status >= 500 || RETRYABLE_STATUSES.has(status)) return "retry";
    return status >= 400 ? "rejected" : "retry";
}
