import { useCallback, useEffect, useState } from "react";

import { verdictFor, type MicVerdict } from "@/lib/mic-check";
import { inputLabelOf, openMicMeter, requestMicStream, stopStream } from "@/lib/mic-meter";
import { checkedToday, lastMicCheck, rememberMicCheck } from "@/lib/mic-check-history";

export type PassiveCheckState = "idle" | "checking" | "done" | "unavailable";

const SAMPLE_MS = 1500;
const SAMPLE_INTERVAL_MS = 100;

async function micPermissionGranted(): Promise<boolean> {
    if (!navigator.permissions) return false;
    try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        return status.state === "granted";
    } catch {
        return false;
    }
}

function samplePeak(stream: MediaStream): Promise<number> {
    return new Promise((resolve) => {
        const meter = openMicMeter(stream);
        const timer = window.setInterval(() => meter.currentRms(), SAMPLE_INTERVAL_MS);
        window.setTimeout(() => {
            window.clearInterval(timer);
            const peak = meter.peakRms();
            meter.close();
            resolve(peak);
        }, SAMPLE_MS);
    });
}

// A short listen before the first patient of the day. It only runs on its own when mic
// permission is already granted — otherwise it waits to be asked, so the doctor never
// gets a surprise permission prompt on the dashboard.
export function usePassiveMicCheck() {
    const [state, setState] = useState<PassiveCheckState>("idle");
    const [verdict, setVerdict] = useState<MicVerdict | null>(() => lastMicCheck()?.verdict ?? null);

    const run = useCallback(async () => {
        setState("checking");
        let stream: MediaStream | null = null;
        try {
            stream = await requestMicStream();
            const peak = await samplePeak(stream);
            const result = verdictFor(peak);
            rememberMicCheck(result, inputLabelOf(stream));
            setVerdict(result);
            setState("done");
        } catch {
            setState("unavailable");
        } finally {
            stopStream(stream);
        }
    }, []);

    useEffect(() => {
        if (checkedToday()) {
            setState("done");
            return;
        }
        void micPermissionGranted().then((granted) => {
            if (granted) void run();
        });
    }, [run]);

    return { state, verdict, run, needsPrompt: state === "idle" };
}
