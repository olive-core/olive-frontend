import api from "@/lib/axios";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { useSilenceDetection } from "./use-silence-detection";

interface UseSessionRecorderProps {
    chunkSizeInMs?: number;
    overlapMs?: number;
    consultationId: string
}

interface UseSessionRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    isSilent: boolean;
    duration: number;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => Promise<void>;
    discardRecording: () => void;
    stream: MediaStream | null;
}

export default function useSessionRecorder({
    consultationId,
    chunkSizeInMs = 30 * 1000, // each window is ~30s — the window transcription models expect
    overlapMs = 2 * 1000,      // consecutive windows share this tail so no word is split at a seam
}: UseSessionRecorderProps): UseSessionRecorderReturn {
    const [duration, setDuration] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const streamRef = useRef<MediaStream | null>(null);
    const activeRecordersRef = useRef<MediaRecorder[]>([]); // windows currently capturing (briefly two, during an overlap)
    const finalRecorderRef = useRef<MediaRecorder | null>(null); // the recorder whose chunk closes the session
    const overlapTimerRef = useRef<number | null>(null); // starts the next window before the current one closes
    const cutTimerRef = useRef<number | null>(null);     // closes the oldest window at the 30s boundary
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

    const sendAudioChunk = useCallback((chunk: Blob, isLastChunk: boolean = false): Promise<void> => {
        const chunkIndex = chunkIndexRef.current;
        chunkIndexRef.current += 1;

        const upload = (async () => {
            try {
                const formData = new FormData();
                formData.append('file', chunk, `chunk-${Date.now()}.webm`);
                formData.append("session_id", consultationId);
                formData.append('chunk_index', chunkIndex.toString());
                formData.append('is_last_chunk', isLastChunk.toString());
                await api.post('/conversation/chunk', formData);
            } catch (error) {
                console.error("Error sending audio chunk:", error);
            }
        })();

        pendingUploadsRef.current.push(upload);
        return upload;
    }, [consultationId]);

    // Each window records into its own buffer and uploads once on stop, so overlapping windows never mix data.
    const startChunkRecorder = useEffectEvent(() => {
        if (!streamRef.current) return;
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm;codecs=opus' });
        const parts: Blob[] = [];
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) parts.push(event.data);
        };
        recorder.onstop = () => {
            if (isDiscardingRef.current || parts.length === 0) return;
            const chunk = new Blob(parts, { type: 'audio/webm' });
            sendAudioChunk(chunk, recorder === finalRecorderRef.current);
        };
        recorder.start();
        activeRecordersRef.current.push(recorder);
    });

    const closeOldestWindow = useEffectEvent(() => {
        const recorder = activeRecordersRef.current.shift();
        if (recorder && recorder.state !== 'inactive') recorder.stop();
    });

    const clearWindowTimers = useEffectEvent(() => {
        if (overlapTimerRef.current) {
            clearTimeout(overlapTimerRef.current);
            overlapTimerRef.current = null;
        }
        if (cutTimerRef.current) {
            clearTimeout(cutTimerRef.current);
            cutTimerRef.current = null;
        }
    });

    // Open the next window `overlapMs` before closing the current one, so the two share that tail of
    // audio: a word landing on the boundary is captured whole in at least one window, and nothing is lost.
    const scheduleWindowCycle = useEffectEvent(() => {
        overlapTimerRef.current = setTimeout(startChunkRecorder, chunkSizeInMs - overlapMs);
        cutTimerRef.current = setTimeout(() => {
            closeOldestWindow();
            scheduleWindowCycle();
        }, chunkSizeInMs);
    });

    const cleanup = useEffectEvent(() => {
        clearWindowTimers();
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        activeRecordersRef.current.forEach((recorder) => {
            if (recorder.state !== 'inactive') recorder.stop();
        });
        activeRecordersRef.current = [];

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        pendingUploadsRef.current = [];
        finalRecorderRef.current = null;
        startTimeRef.current = 0;
        accumulatedMsRef.current = 0;
        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
    });

    const pauseRecording = useCallback(() => {
        const recording = activeRecordersRef.current.filter(recorder => recorder.state === 'recording');
        if (recording.length === 0) return;
        recording.forEach(recorder => recorder.pause());

        // Suspend window rotation while paused; the timer banks the running segment and stops.
        clearWindowTimers();
        if (startTimeRef.current) {
            accumulatedMsRef.current += Date.now() - startTimeRef.current;
            startTimeRef.current = 0;
        }
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        setIsPaused(true);
    }, [clearWindowTimers]);

    const resumeRecording = useCallback(() => {
        const paused = activeRecordersRef.current.filter(recorder => recorder.state === 'paused');
        if (paused.length === 0) return;
        paused.forEach(recorder => recorder.resume());

        scheduleWindowCycle();
        startTimeRef.current = Date.now();
        startDurationTimer();
        setIsPaused(false);
    }, [scheduleWindowCycle]);

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

    const stopRecording = useCallback(async (): Promise<void> => {
        isFinalizingRef.current = true;
        setIsRecording(false);

        // Stop the rotation so no new window spins up while we finish.
        clearWindowTimers();
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        const recorders = activeRecordersRef.current;
        activeRecordersRef.current = [];
        const finalRecorder = recorders[recorders.length - 1] ?? null;
        finalRecorderRef.current = finalRecorder;

        // Close earlier overlapping windows first; the newest carries is_last_chunk so the server
        // finalizes the session only after every window has been sent.
        const earlierRecorders = recorders.slice(0, -1);
        await Promise.all(earlierRecorders.map(stopAndFlush));
        if (finalRecorder) await stopAndFlush(finalRecorder);

        // Wait until every chunk — including the final one — is persisted, then release the mic.
        await Promise.allSettled(pendingUploadsRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }, [clearWindowTimers, stopAndFlush]);

    const discardRecording = useCallback(() => {
        isDiscardingRef.current = true;
        cleanup();
        setIsRecording(false);
    }, [cleanup]);

    const startRecording = useEffectEvent(async () => {
        try {
            // Reset state
            setDuration(0);
            setIsRecording(false);
            isFinalizingRef.current = false;
            isDiscardingRef.current = false;
            chunkIndexRef.current = 0;
            finalRecorderRef.current = null;
            activeRecordersRef.current = [];
            pendingUploadsRef.current = [];

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

            startChunkRecorder();  // first window: [0, chunkSizeInMs]
            scheduleWindowCycle(); // every later window opens overlapMs before the previous one closes
            startDurationTimer();
        } catch (error) {
            console.error("Error starting recording:", error);
            cleanup();
        }
    });

    // Warn about a dead/muted mic only while actively capturing — paused gaps are expected silence.
    const isSilent = useSilenceDetection(streamRef.current, isRecording && !isPaused);

    // Auto-start recording on mount
    useEffect(() => {
        startRecording();

        // Cleanup on unmount — skip while a graceful stop is still uploading the final chunk
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
        duration,
        pauseRecording,
        resumeRecording,
        stopRecording,
        discardRecording,
        stream: streamRef.current
    };
}
