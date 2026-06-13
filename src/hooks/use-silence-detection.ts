import { useEffect, useState } from "react";
import { computeRms } from "@/lib/audio";

interface SilenceDetectionOptions {
    thresholdRms?: number;
    holdMs?: number;
    sampleIntervalMs?: number;
}

// Defaults catch a genuinely dead/muted mic, not a quiet room: with autoGainControl on, ambient
// noise sits above this floor, so a sustained reading below it means no signal at all.
const DEFAULT_THRESHOLD_RMS = 0.008;
const DEFAULT_HOLD_MS = 8000;
const DEFAULT_SAMPLE_INTERVAL_MS = 500;

// Passively watches a live stream's loudness and reports `true` once it has been effectively
// silent for `holdMs`. Read-only — it never touches the recording itself.
export function useSilenceDetection(
    stream: MediaStream | null,
    active: boolean,
    {
        thresholdRms = DEFAULT_THRESHOLD_RMS,
        holdMs = DEFAULT_HOLD_MS,
        sampleIntervalMs = DEFAULT_SAMPLE_INTERVAL_MS,
    }: SilenceDetectionOptions = {},
): boolean {
    const [isSilent, setIsSilent] = useState(false);

    useEffect(() => {
        if (!active || !stream) {
            setIsSilent(false);
            return;
        }

        const audio = new AudioContext();
        const source = audio.createMediaStreamSource(stream);
        const analyser = audio.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.fftSize);
        let lastSoundAt = Date.now();

        const intervalId = window.setInterval(() => {
            analyser.getByteTimeDomainData(buffer);
            if (computeRms(buffer) > thresholdRms) {
                lastSoundAt = Date.now();
                setIsSilent(false);
            } else if (Date.now() - lastSoundAt > holdMs) {
                setIsSilent(true);
            }
        }, sampleIntervalMs);

        return () => {
            clearInterval(intervalId);
            analyser.disconnect();
            source.disconnect();
            audio.close();
            setIsSilent(false);
        };
    }, [stream, active, thresholdRms, holdMs, sampleIntervalMs]);

    return isSilent;
}
