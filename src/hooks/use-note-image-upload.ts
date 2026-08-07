import { useState } from "react";
import toast from "react-hot-toast";

import {
    MAX_NOTE_IMAGES,
    deleteNoteImage,
    noteImageRejection,
    uploadNoteImage,
} from "@/lib/note-images";
import type { NoteImageType } from "@/types/prescription";

interface UseNoteImageUploadOptions {
    sessionId?: string | null;
    /** Photos already on the note — used to enforce the per-note cap. */
    current:    NoteImageType[];
    onUploaded: (images: NoteImageType[]) => void;
    onRemoved:  (image: NoteImageType) => void;
}

/**
 * Validates, uploads and removes clinical-note photos. Each file goes to storage as soon
 * as it is picked, so the note only ever holds blob names — shared by the in-session
 * editor and the saved consultation so both behave identically.
 */
export function useNoteImageUpload({ sessionId, current, onUploaded, onRemoved }: UseNoteImageUploadOptions) {
    const [uploadingCount, setUploadingCount] = useState(0);

    const addImages = async (files: File[]) => {
        if (!sessionId) {
            toast.error("Photos can be added once the consultation has started");
            return;
        }

        const room = MAX_NOTE_IMAGES - current.length - uploadingCount;
        if (room <= 0) {
            toast.error(`Up to ${MAX_NOTE_IMAGES} photos per note`);
            return;
        }
        if (files.length > room) {
            toast.error(`Only ${room} more photo${room === 1 ? "" : "s"} fit on this note`);
        }

        const accepted: File[] = [];
        for (const file of files.slice(0, room)) {
            const rejection = noteImageRejection(file);
            if (rejection) toast.error(rejection);
            else accepted.push(file);
        }
        if (accepted.length === 0) return;

        setUploadingCount((count) => count + accepted.length);
        try {
            const results = await Promise.allSettled(accepted.map((file) => uploadNoteImage(sessionId, file)));
            const uploaded = results
                .filter((result): result is PromiseFulfilledResult<NoteImageType> => result.status === "fulfilled")
                .map((result) => result.value);

            const failed = results.length - uploaded.length;
            if (failed > 0) toast.error(`${failed} photo${failed === 1 ? "" : "s"} failed to upload`);
            if (uploaded.length > 0) onUploaded(uploaded);
        } finally {
            setUploadingCount((count) => Math.max(0, count - accepted.length));
        }
    };

    const removeImage = async (image: NoteImageType) => {
        // Drop it from the note first: a stored file the note no longer points at is
        // harmless, but a note pointing at a deleted file shows a broken tile.
        onRemoved(image);
        try {
            await deleteNoteImage(image.blob_name);
        } catch {
            // The note is already saved without it; the orphaned file is not worth a toast.
        }
    };

    return { uploadingCount, addImages, removeImage };
}
