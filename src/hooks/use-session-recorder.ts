import api from "@/lib/axios";
import { PausableTimeout } from "@/lib/pausable-timeout";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { useSilenceDetection } from "./use-silence-detection";
import { useStableCallback } from "./use-stable-callback";

interface UseSessionRecorderProps {
    chunkSizeInMs?: number;
    overlapMs?: number;
}

// Every function here has a permanent identity (see useStableCallback), so callers can
// safely list them as effect dependencies. That is load-bearing: the recorder is started
// from an effect, and an unstable identity there restarts it on every render.
interface UseSessionRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    isSilent: boolean;
    /** The microphone could not be opened — permission denied, or no input device. */
    isMicrophoneUnavailable: boolean;
    /** Chunks that never reached the server, even after a retry. */
    failedChunkCount: number;
    duration: number;
    startRecording: (consultationId: string) => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => Promise<void>;
    discardRecording: () => Promise<void>;
    stream: MediaStream | null;
}

// A window is one MediaRecorder plus the timer that closes it. Windows open on a steady
// chunkSizeInMs cadence and each records for chunkSizeInMs + overlapMs, so every consecutive
// pair shares an overlapMs tail and no word is split at a seam.
interface RecordingWindow {
    recorder: MediaRecorder;
    closeTimer: PausableTimeout;
}

// Identifies the chunking algorithm the stored chunks were captured with, so they can be
// merged into a continuous recording later. Bump the version if the algorithm changes.
const CHUNKING_SCHEME = "listen-v1";

// Capturing audio is deliberately decoupled from any one screen: the caller starts a
// recording for a consultation and keeps the hook mounted above the router, so the
// microphone survives navigation. Nothing here knows which page is on screen.
export default function useSessionRecorder({
    chunkSizeInMs = 30 * 1000, // the cadence at which a new window opens
    overlapMs = 2 * 1000,      // extra tail each window records past the next window's start
}: UseSessionRecorderProps = {}): UseSessionRecorderReturn {
    const [duration, setDuration] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isMicrophoneUnavailable, setIsMicrophoneUnavailable] = useState<boolean>(false);
    const [failedChunkCount, setFailedChunkCount] = useState<number>(0);

    const consultationIdRef = useRef<string>("");  // the session the current chunks belong to
    const isStartingRef = useRef<boolean>(false);  // true from the start request until capture is live
    const streamRef = useRef<MediaStream | null>(null);
    const activeWindowsRef = useRef<RecordingWindow[]>([]); // capturing now (briefly two, during an overlap)
    const openWindowTimerRef = useRef<PausableTimeout | null>(null); // fires every chunkSizeInMs to open the next window
    const startTimeRef = useRef<number>(0);       // start of the current running segment; 0 while paused/stopped
    const accumulatedMsRef = useRef<number>(0);   // elapsed time banked from previous running segments
    const durationIntervalRef = useRef<number | null>(null);
    const chunkIndexRef = useRef<number>(0);
    const pendingUploadsRef = useRef<Promise<void>[]>([]); // Every in-flight chunk upload
    const isFinalizingRef = useRef<boolean>(false); // True while a graceful stop finishes uploading
    const isDiscardingRef = useRef<boolean>(false); // True while discarding, so stopped windows are not uploaded

    // The displayed timer must exclude paused gaps, so it sums banked segments plus the live one.
    const startDurationTimer = () => {
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = setInterval(() => {
            const live = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
            setDuration(Math.floor((accumulatedMsRef.current + live) / 1000));
        }, 250);
    };

    // A chunk that never lands is audio the doctor believes was captured, so a failed
    // upload is retried once and then counted — silence here means silent data loss.
    const sendAudioChunk = useCallback((chunk: Blob): Promise<void> => {
        const chunkIndex = chunkIndexRef.current;
        chunkIndexRef.current += 1;

        const postChunk = () => {
            const formData = new FormData();
            formData.append('file', chunk, `chunk-${Date.now()}.webm`);
            formData.append("session_id", consultationIdRef.current);
            formData.append('chunk_index', chunkIndex.toString());
            formData.append('chunking_scheme', CHUNKING_SCHEME);
            formData.append('chunk_size_ms', chunkSizeInMs.toString());
            formData.append('overlap_ms', overlapMs.toString());
            return api.post('/conversation/chunk', formData);
        };

        const upload = (async () => {
            try {
                await postChunk();
            } catch {
                try {
                    await postChunk();
                } catch (error) {
                    console.error("Audio chunk failed to upload after retry:", error);
                    setFailedChunkCount((count) => count + 1);
                }
            }
        })();

        pendingUploadsRef.current.push(upload);
        return upload;
    }, [chunkSizeInMs, overlapMs]);

    const closeWindow = useEffectEvent((recorder: MediaRecorder) => {
        activeWindowsRef.current = activeWindowsRef.current.filter((window) => {
            if (window.recorder !== recorder) return true;
            window.closeTimer.cancel();
            return false;
        });
        if (recorder.state !== 'inactive') recorder.stop();
    });

    // Each window records into its own buffer and uploads once on stop, so overlapping windows never mix data.
    const openWindow = useEffectEvent(() => {
        if (!streamRef.current) return;
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm;codecs=opus' });
        const parts: Blob[] = [];
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) parts.push(event.data);
        };
        recorder.onstop = () => {
            if (isDiscardingRef.current || parts.length === 0) return;
            const chunk = new Blob(parts, { type: 'audio/webm' });
            sendAudioChunk(chunk);
        };
        recorder.start();

        const closeTimer = new PausableTimeout(chunkSizeInMs + overlapMs, () => closeWindow(recorder));
        closeTimer.start();
        activeWindowsRef.current.push({ recorder, closeTimer });
    });

    const scheduleNextWindow = useEffectEvent(() => {
        openWindowTimerRef.current = new PausableTimeout(chunkSizeInMs, () => {
            openWindow();
            scheduleNextWindow();
        });
        openWindowTimerRef.current.start();
    });

    // Pause/resume/cancel every live timer together: the opener and each open window's close timer.
    // Pausing preserves each timer's remaining time, so a chunk paused mid-window still records its
    // full length once resumed — never ballooning past chunkSizeInMs + overlapMs.
    const pauseTimers = useEffectEvent(() => {
        openWindowTimerRef.current?.pause();
        activeWindowsRef.current.forEach((window) => window.closeTimer.pause());
    });

    const resumeTimers = useEffectEvent(() => {
        openWindowTimerRef.current?.start();
        activeWindowsRef.current.forEach((window) => window.closeTimer.start());
    });

    const cancelTimers = useEffectEvent(() => {
        openWindowTimerRef.current?.cancel();
        openWindowTimerRef.current = null;
        activeWindowsRef.current.forEach((window) => window.closeTimer.cancel());
    });

    const cleanup = useEffectEvent(() => {
        cancelTimers();
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        activeWindowsRef.current.forEach((window) => {
            if (window.recorder.state !== 'inactive') window.recorder.stop();
        });
        activeWindowsRef.current = [];

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        pendingUploadsRef.current = [];
        startTimeRef.current = 0;
        accumulatedMsRef.current = 0;
        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
    });

    const pauseRecording = useStableCallback(() => {
        const recording = activeWindowsRef.current.filter(window => window.recorder.state === 'recording');
        if (recording.length === 0) return;
        recording.forEach(window => window.recorder.pause());

        pauseTimers();
        if (startTimeRef.current) {
            accumulatedMsRef.current += Date.now() - startTimeRef.current;
            startTimeRef.current = 0;
        }
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        setIsPaused(true);
    });

    const resumeRecording = useStableCallback(() => {
        const paused = activeWindowsRef.current.filter(window => window.recorder.state === 'paused');
        if (paused.length === 0) return;
        paused.forEach(window => window.recorder.resume());

        resumeTimers();
        startTimeRef.current = Date.now();
        startDurationTimer();
        setIsPaused(false);
    });

    const stopAndFlush = useEffectEvent((recorder: MediaRecorder): Promise<void> =>
        new Promise((resolve) => {
            if (recorder.state === 'inactive') {
                resolve();
                return;
            }
            const uploadOnStop = recorder.onstop;
            recorder.onstop = (event) => {
                uploadOnStop?.call(recorder, event);
                resolve();
            };
            recorder.stop();
        })
    );

    const stopRecording = useStableCallback(async (): Promise<void> => {
        isFinalizingRef.current = true;
        setIsRecording(false);

        // Stop the rotation so no new window spins up while we finish.
        cancelTimers();
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        const windows = activeWindowsRef.current;
        activeWindowsRef.current = [];
        const finalRecorder = windows[windows.length - 1]?.recorder ?? null;

        // Close earlier overlapping windows first, then the newest, so chunks upload in order.
        const earlierRecorders = windows.slice(0, -1).map(window => window.recorder);
        await Promise.all(earlierRecorders.map(stopAndFlush));
        if (finalRecorder) await stopAndFlush(finalRecorder);

        // Wait until every chunk — including the final one — is persisted, then release the mic.
        await Promise.allSettled(pendingUploadsRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    });

    // Resolves once in-flight uploads have settled, so the caller can safely delete
    // the session and its audio without a late chunk racing the delete.
    const discardRecording = useStableCallback((): Promise<void> => {
        isDiscardingRef.current = true;
        const inFlightUploads = pendingUploadsRef.current;
        cleanup();
        setIsRecording(false);
        return Promise.allSettled(inFlightUploads).then(() => undefined);
    });

    // A second start while one is already live would open a parallel MediaRecorder and
    // upload duplicate audio with no handle left to stop it, so capture refuses to
    // stack. This is the hard stop behind every caller: whatever a screen does with its
    // effects, only one recording can exist.
    const isCapturing = () =>
        isStartingRef.current || streamRef.current !== null || activeWindowsRef.current.length > 0;

    const beginRecording = useEffectEvent(async (consultationId: string) => {
        if (isCapturing()) return;
        isStartingRef.current = true;
        try {
            // Reset state
            setDuration(0);
            setIsRecording(false);
            setIsMicrophoneUnavailable(false);
            consultationIdRef.current = consultationId;
            isFinalizingRef.current = false;
            isDiscardingRef.current = false;
            chunkIndexRef.current = 0;
            openWindowTimerRef.current = null;
            activeWindowsRef.current = [];
            pendingUploadsRef.current = [];
            setFailedChunkCount(0);

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                }
            });

            streamRef.current = stream;

            setIsRecording(true);
            setIsPaused(false);
            startTimeRef.current = Date.now();
            accumulatedMsRef.current = 0;

            openWindow();          // first window: [0, chunkSizeInMs + overlapMs]
            scheduleNextWindow();  // every later window opens one chunkSizeInMs after the last
            startDurationTimer();
        } catch (error) {
            // A denied or missing microphone is a state the doctor has to see and act on,
            // not a silent no-op that leaves a dead timer on screen.
            console.error("Error starting recording:", error);
            cleanup();
            setIsMicrophoneUnavailable(true);
        } finally {
            isStartingRef.current = false;
        }
    });

    const startRecording = useStableCallback((consultationId: string) => {
        void beginRecording(consultationId);
    });

    // Warn about a dead/muted mic only while actively capturing — paused gaps are expected silence.
    const isSilent = useSilenceDetection(streamRef.current, isRecording && !isPaused);

    // Release the microphone if the hook itself goes away (leaving the dashboard, signing
    // out) — but never while a graceful stop is still uploading the final chunk.
    useEffect(() => {
        return () => {
            if (!isFinalizingRef.current) {
                cleanup();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isRecording,
        isPaused,
        isSilent,
        isMicrophoneUnavailable,
        failedChunkCount,
        duration,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        discardRecording,
        stream: streamRef.current
    };
}
