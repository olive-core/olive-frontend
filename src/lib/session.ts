import api from "@/lib/axios";

// Deletes a session and its stored audio chunks. Used when a consultation is
// discarded so no abandoned session or orphaned audio is left behind.
export const deleteSession = (sessionId: string) =>
    api.delete(`/session/${sessionId}`);
