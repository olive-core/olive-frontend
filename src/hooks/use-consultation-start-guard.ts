import toast from "react-hot-toast";

import { useRecordingSession } from "@/hooks/use-recording-session";

// Only one consultation can be recorded at a time — there is one microphone, and a
// second session would silently split the conversation in two. Every path that starts a
// consultation asks here first, so a running recording is never interrupted by a
// mis-tap on the queue or the phone-number entry.
export function useConsultationStartGuard(): () => boolean {
    const { target } = useRecordingSession();

    return () => {
        if (!target) return true;
        toast.error("A consultation is still recording. Finish it first.");
        return false;
    };
}
