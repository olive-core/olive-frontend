import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import useSessionRecorder from "@/hooks/use-session-recorder";
import { useAudioQueueStatus } from "@/hooks/use-audio-queue-status";
import {
    RecordingSessionContext,
    type RecordingSession,
    type RecordingStatus,
    type RecordingTarget,
} from "@/hooks/use-recording-session";
import { useStableCallback } from "@/hooks/use-stable-callback";
import { setDrainUrgency, startDrainer, sweepSyncedChunks } from "@/lib/audio-queue";
import { trackRecordingFinalization } from "@/lib/recording-finalization";
import { forgetRecorderRect } from "./recorder-morph";

interface RecorderState {
    isRecording:             boolean;
    isPaused:                boolean;
    isSilent:                boolean;
    isMicrophoneUnavailable: boolean;
    isStorageFull:           boolean;
}

function recordingStatus(
    { isRecording, isPaused, isSilent, isMicrophoneUnavailable, isStorageFull }: RecorderState,
): RecordingStatus {
    if (isStorageFull) return "storage-full";
    if (isMicrophoneUnavailable) return "unavailable";
    if (!isRecording) return "starting";
    if (isPaused) return "paused";
    if (isSilent) return "silent";
    return "listening";
}

// Owns the one recorder the whole dashboard shares. Mounted above the router outlet, so
// navigating between pages mid-consultation never touches the microphone.
export default function RecordingSessionProvider({ children }: { children: ReactNode }) {
    const recorder = useSessionRecorder({ chunkSizeInMs: 30 * 1000 });
    const queue = useAudioQueueStatus();
    const [target, setTarget] = useState<RecordingTarget | null>(null);
    const [inlineRecorderCount, setInlineRecorderCount] = useState(0);

    // The queue outlives any one recording: chunks left unsent by a closed tab or a
    // reload are picked up here, and the sweep clears receipts nothing is waiting on.
    useEffect(() => {
        startDrainer();
        void sweepSyncedChunks();
    }, []);

    // Actions read the live target without depending on the render that set it.
    const targetRef = useRef<RecordingTarget | null>(null);
    // Sessions whose recording has already ended, so returning to a finished
    // consultation can never quietly start recording it a second time.
    const finishedSessionIdsRef = useRef<Set<string>>(new Set());

    const setActiveTarget = useCallback((next: RecordingTarget | null) => {
        targetRef.current = next;
        setTarget(next);
    }, []);

    const endSession = useCallback(() => {
        const current = targetRef.current;
        if (current) finishedSessionIdsRef.current.add(current.sessionId);
        setActiveTarget(null);
        return current;
    }, [setActiveTarget]);

    const { startRecording: startCapture, stopRecording, discardRecording: discardCapture } = recorder;

    const startRecording = useCallback((next: RecordingTarget) => {
        if (targetRef.current || finishedSessionIdsRef.current.has(next.sessionId)) return;
        setDrainUrgency("patient");
        setActiveTarget(next);
    }, [setActiveTarget]);

    // Capture follows the target's SESSION ID, never the target object or a function
    // identity: anything unstable in this dependency list re-runs the effect on every
    // render, and each run would open another microphone. Starting and releasing are the
    // same effect, so they can never get out of step.
    const activeSessionId = target?.sessionId ?? null;
    useEffect(() => {
        if (activeSessionId) startCapture(activeSessionId);
    }, [activeSessionId, startCapture]);

    const retryRecording = useStableCallback(() => {
        if (activeSessionId) startCapture(activeSessionId);
    });

    // Capture is written to the device in milliseconds, which is all the prescribe screen
    // waits on. Delivery carries on in the background — but from here a doctor is watching
    // it, so the queue stops being patient about retries.
    const finishRecording = useCallback(() => {
        const finished = endSession();
        if (!finished) return;
        trackRecordingFinalization(finished.sessionId, stopRecording());
        setDrainUrgency("urgent");
        void sweepSyncedChunks();
    }, [endSession, stopRecording]);

    const discardRecording = useCallback(() => {
        endSession();
        setDrainUrgency("patient");
        return discardCapture();
    }, [endSession, discardCapture]);

    const registerInlineRecorder = useCallback(() => {
        setInlineRecorderCount((count) => count + 1);
        return () => setInlineRecorderCount((count) => count - 1);
    }, []);

    const hasFinished = useCallback((sessionId: string) => finishedSessionIdsRef.current.has(sessionId), []);

    // The surface a session ended on is no place for the next session's card to fly in
    // from. This runs after the leaving surface has stored its rect, so it wins.
    useEffect(() => {
        if (!target) forgetRecorderRect();
    }, [target]);

    // Leaving with audio the server has not acknowledged costs time, not data — the queue
    // is on disk and resumes on the next load. iOS honours this prompt inconsistently,
    // which is exactly why durability, rather than this warning, is the actual defence.
    const hasUnsentAudio = queue.pending > 0 || queue.rejected > 0;
    useEffect(() => {
        if (!target && !hasUnsentAudio) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [target, hasUnsentAudio]);

    const status = recordingStatus(recorder);

    const value = useMemo<RecordingSession>(() => ({
        target,
        status,
        duration:         recorder.duration,
        queue,
        hasInlineRecorder: inlineRecorderCount > 0,
        hasFinished,
        startRecording,
        retryRecording,
        pauseRecording:  recorder.pauseRecording,
        resumeRecording: recorder.resumeRecording,
        finishRecording,
        discardRecording,
        registerInlineRecorder,
    }), [
        target,
        status,
        recorder.duration,
        queue,
        recorder.pauseRecording,
        recorder.resumeRecording,
        inlineRecorderCount,
        hasFinished,
        startRecording,
        retryRecording,
        finishRecording,
        discardRecording,
        registerInlineRecorder,
    ]);

    return <RecordingSessionContext value={value}>{children}</RecordingSessionContext>;
}
