import Prescription from '@/components/prescription'
import PrescriptionSkeleton from '@/components/prescription/prescription-skeleton'
import { awaitRecordingFinalization } from '@/lib/recording-finalization';
import { useAuthStore } from '@/stores/auth-store';
import { usePrescriptionStore } from '@/stores/prescription-store'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react';

export const Route = createFileRoute('/doctor/prescribe/$consultationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { consultationId } = Route.useParams();
  const { getInitialPrescription, setPartialData, setGenerating } = usePrescriptionStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { clinician } = useAuthStore();

  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasBeenGenerated, setHasBeenGenerated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function handleCancelSSE() {
    abortRef.current?.abort();
    setIsReady(true);
    setGenerating(false);
    setHasBeenGenerated(true);
  }

  function startSSE() {
    const { resetStore } = usePrescriptionStore.getState();
    resetStore();

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsError(false);
    setIsReady(false);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    // The recorder may still be uploading the final audio chunk. Wait for it so the
    // draft is generated from the complete transcription; the skeleton covers this wait.
    awaitRecordingFinalization(consultationId)
      .then(() => fetch('/api/v1/aris/generate-progressive', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: consultationId,
          dialogue: "",
          force_variant: '',
          persist_draft: true,
        }),
        signal: controller.signal,
      }))
      .then(async (res) => {
        if (!res.ok || !res.body) {
          setIsError(true);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';

        // Parse the SSE stream line-by-line
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              const rawData = line.slice(5).trim();

              let parsed: any;
              try {
                parsed = JSON.parse(rawData);
              } catch {
                continue;
              }

              const payload = parsed?.payload;

              switch (currentEvent) {
                case 'accepted':
                  // optional UX hook
                  setGenerating(true);
                  break;

                case 'stage01_complete': // v2_faster
                case 'layer00_complete': // v1_standard
                  if (payload) {
                    setPartialData(payload);
                  }
                  break;

                case 'completed':
                  if (payload) {
                    getInitialPrescription(payload);
                    setIsReady(true);
                    setGenerating(false);
                    setHasBeenGenerated(true);
                  }
                  reader.cancel();
                  return;

                default:
                  break;
              }

              currentEvent = '';
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsError(true);
        }
      });
  }

  useEffect(() => {
    if (clinician?.generate_ai_draft !== false) {
      startSSE();
    } else {
      const { resetStore } = usePrescriptionStore.getState();
      resetStore();
      void awaitRecordingFinalization(consultationId);
      setIsReady(true)
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [consultationId]);

  if (isError && !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 font-medium text-center">
          Failed to generate prescription.
        </div>
        <button
          onClick={startSSE}
          className="h-9 px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!isReady) {
    return <PrescriptionSkeleton onCancel={handleCancelSSE} sessionId={consultationId} />
  }

  return (
    <>
      <Prescription 
        onGenerate={startSSE} 
        onCancel={handleCancelSSE}
        hasBeenGenerated={hasBeenGenerated}
      />
    </>
  )
}
