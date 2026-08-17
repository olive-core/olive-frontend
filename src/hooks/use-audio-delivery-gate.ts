import { useRef, useState } from "react";

import { unsentChunkCount, waitForDelivery } from "@/lib/audio-queue";
import { useStableCallback } from "@/hooks/use-stable-callback";

// Long enough that a normal consultation never sees the prompt — by the time Finish is
// pressed only the last chunk is usually in flight — and short enough that nobody stares
// at a spinner wondering whether it is stuck.
const DECISION_AFTER_MS = 20_000;

type GateChoice = "wait" | "generate";

export interface AudioDeliveryGate {
    /** Set while the doctor is being asked what to do about audio still on the device. */
    unsentChunkPrompt: number | null;
    keepWaiting:       () => void;
    generateAnyway:    () => void;
    /** Resolves once the audio is delivered, or once the doctor decides to go without it. */
    awaitDelivery:     (sessionId: string, signal: AbortSignal) => Promise<void>;
}

/**
 * Holds generation until the server has every second of the consultation.
 *
 * The two failure modes this exists to rule out are generating from a transcript with
 * holes in it, and blocking a doctor forever on a network that is not coming back. So the
 * wait is bounded, and what happens at the end of it is the doctor's call, made with the
 * real numbers in front of them.
 */
export function useAudioDeliveryGate(): AudioDeliveryGate {
    const [unsentChunkPrompt, setUnsentChunkPrompt] = useState<number | null>(null);
    const answerRef = useRef<((choice: GateChoice) => void) | null>(null);

    const answer = (choice: GateChoice) => {
        setUnsentChunkPrompt(null);
        answerRef.current?.(choice);
        answerRef.current = null;
    };

    const keepWaiting = useStableCallback(() => answer("wait"));
    const generateAnyway = useStableCallback(() => answer("generate"));

    const askDoctor = (unsent: number, signal: AbortSignal): Promise<GateChoice> => {
        setUnsentChunkPrompt(unsent);
        return new Promise((resolve) => {
            answerRef.current = resolve;
            signal.addEventListener("abort", () => answer("wait"), { once: true });
        });
    };

    const awaitDelivery = useStableCallback(async (sessionId: string, signal: AbortSignal) => {
        while (!signal.aborted) {
            if (await waitForDelivery(sessionId, DECISION_AFTER_MS, signal) === "delivered") return;

            const unsent = await unsentChunkCount(sessionId);
            if (unsent === 0) return;
            if (await askDoctor(unsent, signal) === "generate") return;
        }
    });

    return { unsentChunkPrompt, keepWaiting, generateAnyway, awaitDelivery };
}
