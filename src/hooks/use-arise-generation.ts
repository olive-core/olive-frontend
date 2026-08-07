import { useEffect, useRef, useState } from 'react';
import { generateAriseDraft } from '@/lib/arise-stream';
import { awaitRecordingFinalization } from '@/lib/recording-finalization';
import { useAuthStore } from '@/stores/auth-store';
import { usePrescriptionStore } from '@/stores/prescription-store';
import { useStableCallback } from '@/hooks/use-stable-callback';

/**
 * Drives one consultation's AI draft and keeps the screen honest about it: a run always
 * ends either ready or failed, never in the loading state it started in. Retries happen
 * inside `generateAriseDraft` and deliberately leave this state untouched, so a recovered
 * run is indistinguishable from one that worked first time.
 */
export function useAriseGeneration(sessionId: string) {
    const accessToken = useAuthStore((s) => s.accessToken);

    const [isReady, setIsReady] = useState(false);
    const [isError, setIsError] = useState(false);
    const [hasBeenGenerated, setHasBeenGenerated] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const settle = useStableCallback(() => {
        setIsReady(true);
        usePrescriptionStore.getState().setGenerating(false);
        setHasBeenGenerated(true);
    });

    const fail = useStableCallback((reason: string) => {
        console.error('[arise] generation failed:', reason);
        setIsError(true);
        usePrescriptionStore.getState().setGenerating(false);
    });

    const run = useStableCallback(async (signal: AbortSignal) => {
        const store = usePrescriptionStore.getState();
        try {
            // The recorder may still be uploading the final audio chunk. Wait for it so the
            // draft is generated from the complete transcription; the skeleton covers this wait.
            await awaitRecordingFinalization(sessionId);

            const outcome = await generateAriseDraft({
                sessionId,
                accessToken: accessToken ?? null,
                signal,
                handlers: {
                    onPartial: store.setPartialData,
                    onScribe: store.applyScribeData,
                    onDecide: store.applyDecideData,
                    onCompleted: (draft) => {
                        void store.getInitialPrescription(draft);
                        settle();
                    },
                },
            });

            if (outcome.status === 'failed') fail(outcome.reason);
        } catch (error) {
            if (!isAbort(error)) fail(errorMessage(error));
        }
    });

    const start = useStableCallback(() => {
        usePrescriptionStore.getState().resetStore();

        // Cancel any in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsError(false);
        setIsReady(false);
        // Generation starts now, not when the server's `accepted` event lands. The wait for
        // the final audio chunk sits in between, and during it the only honest action to
        // offer is Cancel.
        usePrescriptionStore.getState().setGenerating(true);

        void run(controller.signal);
    });

    const cancel = useStableCallback(() => {
        abortRef.current?.abort();
        settle();
    });

    // Doctors who draft by hand still need the recording finalized before they save.
    const skip = useStableCallback(() => {
        usePrescriptionStore.getState().resetStore();
        void awaitRecordingFinalization(sessionId);
        setIsReady(true);
    });

    useEffect(() => () => abortRef.current?.abort(), [sessionId]);

    return { isReady, isError, hasBeenGenerated, start, cancel, skip };
}

function isAbort(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
