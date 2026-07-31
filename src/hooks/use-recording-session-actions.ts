import { useNavigate } from "@tanstack/react-router";

import { useRecordingSession } from "@/hooks/use-recording-session";
import { releaseQueueSession } from "@/lib/attendant-queue";
import { deleteSession } from "@/lib/session";

// Ending a recording always means the same three things — stop capture, clean up the
// session, go somewhere — whether the doctor acts from the consultation screen or from
// the floating widget on another page. Both call these, so the two can never diverge.
export function useRecordingSessionActions() {
    const navigate = useNavigate();
    const { target, finishRecording, discardRecording } = useRecordingSession();

    const finishAndPrescribe = () => {
        if (!target) return;
        const { sessionId } = target;
        finishRecording();
        navigate({ to: "/doctor/prescribe/$consultationId", params: { consultationId: sessionId } });
    };

    // Once in-flight uploads settle, delete the abandoned session and its audio, and drop
    // the patient from the queue (a no-op for walk-ins). Both are fire-and-forget so the
    // exit stays instant; the queue panel reconciles live over SSE.
    const discardSession = () => {
        if (!target) return;
        const { sessionId } = target;
        discardRecording().then(() => deleteSession(sessionId)).catch(() => {});
        releaseQueueSession(sessionId).catch(() => {});
        navigate({ to: "/doctor" });
    };

    const openConsultation = () => {
        if (!target) return;
        navigate({
            to:     "/doctor/consultation/$userId/$consultationId",
            params: { userId: target.patientId, consultationId: target.sessionId },
        });
    };

    return { finishAndPrescribe, discardSession, openConsultation };
}
