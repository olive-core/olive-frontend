import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

interface UseSessionRecorderProps {
    chunkSizeInMs?: number;
}

interface UseSessionRecorderReturn {
    isRecording: boolean;
    duration: number;
    stopRecording: () => void;
    discardRecording: () => void;
    stream: MediaStream | null;
}

export default function useSessionRecorder({
    chunkSizeInMs = 1 * 60 * 1000, // 1 minute default
}: UseSessionRecorderProps): UseSessionRecorderReturn {
    const [duration, setDuration] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const startTimeRef = useRef<number>(0);
    const intervalRef = useRef<number | null>(null);
    const durationIntervalRef = useRef<number | null>(null);
    const chunkIndexRef = useRef<number>(0);

    const sendAudioChunk = useCallback(async (chunk: Blob, isLastChunk: boolean = false) => {
        try {
            console.log("Sending audio chunk of size:", chunk.size, "isLastChunk:", isLastChunk);

            // Create FormData instead of raw blob for better compatibility
            const formData = new FormData();
            formData.append('audio', chunk, `chunk-${Date.now()}.webm`);
            formData.append('duration', duration.toString());
            formData.append('isLastChunk', isLastChunk.toString());
            formData.append('timestamp', new Date().toISOString());

            await fetch('/api/upload-audio-chunk?index=' + chunkIndexRef.current, {
                method: 'POST',
                body: formData, // Use FormData instead of raw blob
            });

            chunkIndexRef.current += 1;
        } catch (error) {
            console.error("Error sending audio chunk:", error);
        }
    }, [duration]);

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
        mediaRecorderRef.current = null;
        startTimeRef.current = 0;
        setIsRecording(false);
        setDuration(0);
    });

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);

        // Send final chunk
        if (audioChunksRef.current.length > 0) {
            const finalChunk = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            sendAudioChunk(finalChunk, true);
        }

        cleanup();
    }, [sendAudioChunk, cleanup]);

    const discardRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        // send an api call to notify discard if needed
        setIsRecording(false);
        cleanup();
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

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;

            // Set up event handlers
            mediaRecorder.ondataavailable = handleDataAvailable;

            mediaRecorder.onstop = () => {
                // This gets called when mediaRecorder.stop() is called
                console.log("MediaRecorder stopped");
            };

            // Start recording
            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
            startTimeRef.current = Date.now();

            // Set up chunk sending interval
            intervalRef.current = setInterval(() => {
                if (mediaRecorder.state === "recording" && audioChunksRef.current.length > 0) {
                    const chunk = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    sendAudioChunk(chunk, false);
                    audioChunksRef.current = []; // Clear after sending
                }
            }, chunkSizeInMs);

            // Set up duration timer
            durationIntervalRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

        } catch (error) {
            console.error("Error starting recording:", error);
            cleanup();
        }
    });

    // Auto-start recording on mount
    useEffect(() => {
        startRecording();

        // Cleanup on unmount
        return () => {
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isRecording,
        duration,
        stopRecording,
        discardRecording,
        stream: streamRef.current
    };
}