import api from "@/lib/axios";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { useSilenceDetection } from "./use-silence-detection";

interface UseSessionRecorderProps {
    chunkSizeInMs?: number;
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
    chunkSizeInMs = 1 * 30 * 1000, // 30 second default
}: UseSessionRecorderProps): UseSessionRecorderReturn {
    const [duration, setDuration] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const audioChunksRef = useRef<Blob[]>([]); // Used for collecting chunks within a single recording
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const startTimeRef = useRef<number>(0);       // start of the current running segment; 0 while paused/stopped
    const accumulatedMsRef = useRef<number>(0);   // elapsed time banked from previous running segments
    const intervalRef = useRef<number | null>(null);
    const durationIntervalRef = useRef<number | null>(null);

    // The displayed timer must exclude paused gaps, so it sums banked segments plus the live one.
    const startDurationTimer = () => {
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = setInterval(() => {
            const live = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
            setDuration(Math.floor((accumulatedMsRef.current + live) / 1000));
        }, 250);
    };
    const chunkIndexRef = useRef<number>(0);
    const pendingUploadsRef = useRef<Promise<void>[]>([]); // Every in-flight chunk upload
    const isFinalizingRef = useRef<boolean>(false); // True while a graceful stop finishes uploading

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

    const cleanup = useEffectEvent(() => {
        // Clear intervals first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        // Stop stream tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Reset state
        audioChunksRef.current = [];
        pendingUploadsRef.current = [];
        mediaRecorderRef.current = null;
        startTimeRef.current = 0;
        accumulatedMsRef.current = 0;
        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
    });

    const pauseRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state !== 'recording') return;
        recorder.pause();
        // Bank the running segment and stop the timer; the 30s chunk rotation skips a paused recorder.
        if (startTimeRef.current) {
            accumulatedMsRef.current += Date.now() - startTimeRef.current;
            startTimeRef.current = 0;
        }
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        setIsPaused(true);
    }, []);

    const resumeRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state !== 'paused') return;
        recorder.resume();
        startTimeRef.current = Date.now();
        startDurationTimer();
        setIsPaused(false);
    }, []);

    const stopRecording = useCallback(async (): Promise<void> => {
        isFinalizingRef.current = true;
        setIsRecording(false);

        // Stop the timers so no new recorder spins up while we finish
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            await new Promise<void>((resolve) => {
                recorder.onstop = () => {
                    if (audioChunksRef.current.length > 0) {
                        const finalChunk = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        sendAudioChunk(finalChunk, true);
                    }
                    resolve();
                };
                recorder.stop();
            });
        }

        // Wait until every chunk — including the final one — is persisted, then release the mic
        await Promise.allSettled(pendingUploadsRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }, [sendAudioChunk]);

    const discardRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = () => {
                cleanup();
            };
            mediaRecorderRef.current.stop();
        } else {
            cleanup();
        }
        setIsRecording(false);
    }, [cleanup]);

    const handleDataAvailable = useCallback((event: BlobEvent) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
    }, []);

    const startRecording = useEffectEvent(async () => {
        try {
            // Reset state
            setDuration(0);
            audioChunksRef.current = [];
            setIsRecording(false);

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

            // Helper to start a new MediaRecorder
            const startNewRecorder = () => {
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'audio/webm;codecs=opus'
                });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.onstop = () => {
                    // Send chunk when stopped
                    if (audioChunksRef.current.length > 0) {
                        const chunk = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        sendAudioChunk(chunk, false);
                        audioChunksRef.current = [];
                    }
                };
                mediaRecorder.start();
            };

            setIsRecording(true);
            setIsPaused(false);
            startTimeRef.current = Date.now();
            accumulatedMsRef.current = 0;

            // Start first recorder
            startNewRecorder();

            // Set up chunk interval: stop and restart recorder every chunkSizeInMs
            intervalRef.current = setInterval(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop();
                    // After stop, onstop handler will send chunk and startNewRecorder will be called
                    setTimeout(() => {
                        if (streamRef.current && !isFinalizingRef.current) {
                            startNewRecorder();
                        }
                    }, 100); // Small delay to ensure onstop completes
                }
            }, chunkSizeInMs);

            // Set up duration timer
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