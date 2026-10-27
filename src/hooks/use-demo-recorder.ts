import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_MAX_SECONDS, recordingToWav, startDemo } from "@/lib/try-olive";

export function useDemoRecorder() {
    const [status, setStatus] = useState<"idle" | "starting" | "recording" | "paused" | "preparing" | "ready">("idle");
    const [seconds, setSeconds] = useState(0);
    const [audio, setAudio] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const recorder = useRef<MediaRecorder | null>(null);
    const stream = useRef<MediaStream | null>(null);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const version = useRef(0);
    const busy = useRef(false);
    const elapsed = useRef(0);
    const startedAt = useRef(0);

    const release = useCallback(() => {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        stream.current?.getTracks().forEach((track) => track.stop());
        stream.current = null;
    }, []);

    const reset = useCallback(() => {
        version.current++;
        if (recorder.current) {
            recorder.current.onstop = null;
            recorder.current.ondataavailable = null;
            if (recorder.current.state !== "inactive") recorder.current.stop();
        }
        recorder.current = null;
        release(); busy.current = false;
        setAudio(null); setSeconds(0); setError(null); setStatus("idle");
    }, [release]);

    useEffect(() => () => {
        version.current++;
        if (recorder.current) {
            recorder.current.onstop = null;
            recorder.current.ondataavailable = null;
            if (recorder.current.state !== "inactive") recorder.current.stop();
        }
        release();
    }, [release]);

    const start = async () => {
        if (busy.current) return;
        busy.current = true;
        const current = ++version.current;
        setError(null); setStatus("starting"); setAudio(null); setSeconds(0);
        try {
            if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
                throw new Error("Recording is unavailable in this browser. Open Olive in a recent browser with microphone access.");
            }
            await startDemo();
            if (current !== version.current) return;
            const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
            if (current !== version.current) { media.getTracks().forEach((track) => track.stop()); return; }
            stream.current = media;
            const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
            const capture = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
            recorder.current = capture;
            const parts: Blob[] = [];
            let size = 0;
            capture.ondataavailable = (event) => {
                size += event.data.size;
                if (size > 12 * 1024 * 1024) {
                    reset(); setError("This recording is too large. Try a shorter conversation."); return;
                }
                if (event.data.size) parts.push(event.data);
            };
            capture.onerror = () => {
                reset(); setError("Recording stopped unexpectedly. Check your microphone and try again.");
            };
            capture.onstop = async () => {
                release(); setStatus("preparing");
                try {
                    const wav = await recordingToWav(new Blob(parts, { type: capture.mimeType }));
                    if (current !== version.current) return;
                    setAudio(wav); setStatus("ready");
                } catch {
                    if (current !== version.current) return;
                    busy.current = false;
                    setStatus("idle"); setError("We couldn't prepare the audio. Record at least a second, or try another browser.");
                }
            };
            elapsed.current = 0; startedAt.current = performance.now();
            capture.start(1000); setStatus("recording");
            timer.current = setInterval(() => {
                const duration = elapsed.current + (capture.state === "recording" ? performance.now() - startedAt.current : 0);
                setSeconds(Math.min(DEMO_MAX_SECONDS, Math.floor(duration / 1000)));
                if (duration >= DEMO_MAX_SECONDS * 1000 && capture.state !== "inactive") capture.stop();
            }, 250);
        } catch (cause) {
            if (current !== version.current) return;
            release(); busy.current = false; setStatus("idle");
            setError(cause instanceof DOMException && cause.name === "NotAllowedError"
                ? "Microphone access was blocked. Allow it in your browser settings, then try again."
                : cause instanceof Error ? cause.message : "Couldn't start recording. Please try again.");
        }
    };

    const pause = () => {
        if (recorder.current?.state !== "recording") return;
        elapsed.current += performance.now() - startedAt.current;
        recorder.current.pause(); setStatus("paused");
    };
    const resume = () => {
        if (recorder.current?.state !== "paused") return;
        startedAt.current = performance.now(); recorder.current.resume(); setStatus("recording");
    };
    const finish = () => {
        if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
    };
    return { status, seconds, audio, error, start, pause, resume, finish, reset };
}
