import { useCallback, useEffect, useRef, useState } from "react";

import { MIC_TEST_DURATION_MS, verdictFor, type MicVerdict } from "@/lib/mic-check";
import {
    activeDeviceIdOf,
    inputLabelOf,
    listAudioInputs,
    openMicMeter,
    requestMicStream,
    stopStream,
    type AudioInput,
    type MicMeter,
} from "@/lib/mic-meter";

export type MicTestPhase = "idle" | "requesting" | "ready" | "recording" | "done" | "denied";

interface MicTestState {
    phase:       MicTestPhase;
    /** Live loudness 0–1, for the level bar. */
    level:       number;
    inputLabel:  string;
    /** Every microphone the browser can see, populated once permission is granted. */
    inputs:      AudioInput[];
    activeDeviceId: string;
    verdict:     MicVerdict | null;
    /** Object URL of the recorded sample, so the doctor can hear what Olive heard. */
    playbackUrl: string | null;
    secondsLeft: number;
}

const INITIAL: MicTestState = {
    phase:       "idle",
    level:       0,
    inputLabel:  "",
    inputs:      [],
    activeDeviceId: "",
    verdict:     null,
    playbackUrl: null,
    secondsLeft: 0,
};

// Drives the mic test: hold a stream open, show live level, capture a short sample, then
// hand back both a measured verdict and the audio itself. Playback is the point — a level
// bar proves a device exists, hearing your own voice proves the whole chain works.
export function useMicTest() {
    const [state, setState] = useState<MicTestState>(INITIAL);

    const streamRef = useRef<MediaStream | null>(null);
    const meterRef = useRef<MicMeter | null>(null);
    const levelTimerRef = useRef<number | null>(null);
    const playbackUrlRef = useRef<string | null>(null);

    const patch = (next: Partial<MicTestState>) => setState((current) => ({ ...current, ...next }));

    const releaseAll = useCallback(() => {
        if (levelTimerRef.current) window.clearInterval(levelTimerRef.current);
        levelTimerRef.current = null;
        meterRef.current?.close();
        meterRef.current = null;
        stopStream(streamRef.current);
        streamRef.current = null;
        if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
        playbackUrlRef.current = null;
    }, []);

    useEffect(() => releaseAll, [releaseAll]);

    const start = useCallback(async (deviceId?: string) => {
        releaseAll();
        patch({ phase: "requesting", verdict: null, playbackUrl: null });

        try {
            const stream = await requestMicStream(deviceId);
            streamRef.current = stream;
            meterRef.current = openMicMeter(stream);

            levelTimerRef.current = window.setInterval(() => {
                patch({ level: meterRef.current?.currentRms() ?? 0 });
            }, 100);

            // Device labels only become readable after permission, so the picker is
            // populated from here rather than on mount.
            patch({
                phase:          "ready",
                inputLabel:     inputLabelOf(stream),
                activeDeviceId: activeDeviceIdOf(stream),
                inputs:         await listAudioInputs(),
            });
        } catch {
            patch({ phase: "denied" });
        }
    }, [releaseAll]);

    const record = useCallback(() => {
        const stream = streamRef.current;
        const meter = meterRef.current;
        if (!stream || !meter) return;

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
        const parts: Blob[] = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) parts.push(event.data);
        };
        recorder.onstop = () => {
            const url = URL.createObjectURL(new Blob(parts, { type: "audio/webm" }));
            playbackUrlRef.current = url;
            patch({ phase: "done", verdict: verdictFor(meter.peakRms()), playbackUrl: url });
        };

        // The verdict must reflect this sample only, not noise from before the doctor started.
        meter.resetPeak();
        recorder.start();
        patch({ phase: "recording", secondsLeft: Math.round(MIC_TEST_DURATION_MS / 1000) });

        const countdown = window.setInterval(() => {
            setState((current) => ({ ...current, secondsLeft: Math.max(0, current.secondsLeft - 1) }));
        }, 1000);

        window.setTimeout(() => {
            window.clearInterval(countdown);
            if (recorder.state !== "inactive") recorder.stop();
        }, MIC_TEST_DURATION_MS);
    }, []);

    const reset = useCallback(() => {
        releaseAll();
        setState(INITIAL);
    }, [releaseAll]);

    return { ...state, start, record, reset };
}
