import { createContext, use } from "react";

// The consultation being recorded, shared by every dashboard page. It lives above the
// router so the microphone keeps running while the doctor navigates: the consultation
// screen shows the full recorder card, every other page shows the floating widget, and
// both drive this one recorder.

export interface RecordingTarget {
    sessionId: string;
    patientId: string;
}

// One value covers every state the recording can be in, so the card and the floating
// widget can never disagree about what is happening — and no state (a microphone still
// opening, a denied permission) can leave the doctor looking at a frozen timer.
export type RecordingStatus = "starting" | "listening" | "paused" | "silent" | "unavailable";

export interface RecordingSession {
    target:           RecordingTarget | null;
    status:           RecordingStatus;
    duration:         number;
    failedChunkCount: number;
    /** True while a consultation screen is showing the full recorder card on this page. */
    hasInlineRecorder: boolean;
    hasFinished:       (sessionId: string) => boolean;
    startRecording:    (target: RecordingTarget) => void;
    /** Asks for the microphone again after it was denied or unavailable. */
    retryRecording:    () => void;
    pauseRecording:    () => void;
    resumeRecording:   () => void;
    /** Stops capture and hands the upload promise to the prescribe screen. */
    finishRecording:   () => void;
    discardRecording:  () => Promise<void>;
    /** Effect callback: marks this page as owning the full recorder card. */
    registerInlineRecorder: () => () => void;
}

export const RecordingSessionContext = createContext<RecordingSession | null>(null);

export function useRecordingSession(): RecordingSession {
    const session = use(RecordingSessionContext);
    if (!session) throw new Error("useRecordingSession must be used within a RecordingSessionProvider");
    return session;
}
