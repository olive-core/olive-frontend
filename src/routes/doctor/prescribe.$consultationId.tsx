import Prescription from '@/components/prescription'
import PrescriptionSkeleton from '@/components/prescription/prescription-skeleton'
import { useAriseGeneration } from '@/hooks/use-arise-generation';
import { useAuthStore } from '@/stores/auth-store';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';

export const Route = createFileRoute('/doctor/prescribe/$consultationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { consultationId } = Route.useParams();
  const { clinician } = useAuthStore();
  const { isReady, isError, hasBeenGenerated, start, cancel, skip } = useAriseGeneration(consultationId);

  const wantsAiDraft = clinician?.generate_ai_draft !== false;

  useEffect(() => {
    if (wantsAiDraft) start();
    else skip();
  }, [consultationId, wantsAiDraft, start, skip]);

  if (isError && !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 font-medium text-center">
          Failed to generate prescription.
        </div>
        <button
          onClick={start}
          className="h-9 px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!isReady) {
    return <PrescriptionSkeleton onCancel={cancel} sessionId={consultationId} />
  }

  return (
    <Prescription
      onGenerate={start}
      onCancel={cancel}
      hasBeenGenerated={hasBeenGenerated}
    />
  )
}
