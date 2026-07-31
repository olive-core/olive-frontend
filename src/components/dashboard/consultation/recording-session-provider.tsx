import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import useSessionRecorder from "@/hooks/use-session-recorder";
import {
    RecordingSessionContext,
    type RecordingSession,
    type RecordingStatus,
    type RecordingTarget,
} from "@/hooks/use-recording-session";
import { useStableCallback } from "@/hooks/use-stable-callback";
import { trackRecordingFinalization } from "@/lib/recording-finalization";

interface RecorderState {
    isRecording:             boolean;
    isPaused:                boolean;
    isSilent:                boolean;
    isMicrophoneUnavailable: boolean;
}

function recordingStatus({ isRecording, isPaused, isSilent, isMicrophoneUnavailable }: RecorderState): RecordingStatus {
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
    const [target, setTarget] = useState<RecordingTarget | null>(null);
    const [inlineRecorderCount, setInlineRecorderCount] = useState(0);

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

    // The final chunk keeps uploading in the background; the prescribe screen waits on
    // that promise behind its loading skeleton before generating the draft.
    const finishRecording = useCallback(() => {
        const finished = endSession();
        if (finished) trackRecordingFinalization(finished.sessionId, stopRecording());
    }, [endSession, stopRecording]);

    const discardRecording = useCallback(() => {
        endSession();
        return discardCapture();
    }, [endSession, discardCapture]);

    const registerInlineRecorder = useCallback(() => {
        setInlineRecorderCount((count) => count + 1);
        return () => setInlineRecorderCount((count) => count - 1);
    }, []);

    const hasFinished = useCallback((sessionId: string) => finishedSessionIdsRef.current.has(sessionId), []);

    // A reload or a closed tab loses whatever has not been uploaded yet, so the browser
    // asks first for as long as a recording is running.
    useEffect(() => {
        if (!target) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [target]);

    const status = recordingStatus(recorder);

    const value = useMemo<RecordingSession>(() => ({
        target,
        status,
        duration:         recorder.duration,
        failedChunkCount: recorder.failedChunkCount,
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
        recorder.failedChunkCount,
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
