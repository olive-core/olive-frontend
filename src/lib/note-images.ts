import api from "@/lib/axios";
import type { NoteImageType } from "@/types/prescription";

// Clinical-note photos. Each file is uploaded the moment it is picked, so the note only
// ever carries blob names; the viewable URL is signed by the backend and expires.

export const MAX_NOTE_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_NOTE_IMAGES = 12;

export function isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
}

/** Returns why the file can't be attached, or null when it's fine. */
export function noteImageRejection(file: File): string | null {
    if (!isImageFile(file)) return `${file.name} is not an image`;
    if (file.size > MAX_NOTE_IMAGE_BYTES) return `${file.name} is larger than 10 MB`;
    return null;
}

export async function uploadNoteImage(sessionId: string, file: File): Promise<NoteImageType> {
    const form = new FormData();
    form.append("file", file);
    const response = await api.post(`/prescription/note-image/${sessionId}`, form);
    return response.data;
}

export async function deleteNoteImage(blobName: string): Promise<void> {
    await api.delete("/prescription/note-image", { params: { blob_name: blobName } });
}

/** Fresh signed URLs for a saved consultation's note photos. */
export async function fetchNoteImages(prescriptionId: string): Promise<NoteImageType[]> {
    const response = await api.get(`/prescription/${prescriptionId}/note-images`);
    return response.data;
}

/** What gets persisted with the note — the signed URL is dropped, it goes stale. */
export function noteImagesForSubmit(images: NoteImageType[]) {
    return images.map(({ blob_name, caption, uploaded_at }) => ({
        blob_name,
        caption: caption ?? null,
        uploaded_at: uploaded_at ?? null,
    }));
}
