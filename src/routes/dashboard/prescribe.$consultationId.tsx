import Prescription from '@/components/prescription'
import api from '@/lib/axios';
import { usePrescriptionStore } from '@/stores/prescription-store'
import type { PrescriptionResponseType } from '@/types/prescription';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/dashboard/prescribe/$consultationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { consultationId } = Route.useParams();
  const { getInitialPrescription } = usePrescriptionStore();

  const [isReady, setIsReady] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (): Promise<PrescriptionResponseType> => {
      const res = await api.post('/aris/generate', {
        session_id: consultationId,
      })
      return res.data
    },
    onSuccess: (generatedData) => {
      getInitialPrescription(generatedData)
      setIsReady(true)
    }
  })

  const draftQuery = useQuery({
    queryKey: ['prescriptionDraft', consultationId],
    queryFn: async (): Promise<PrescriptionResponseType> => {
      const res = await api.get(`/prescription/draft/${consultationId}`)
      return res.data
    },
    retry: false,
    enabled: false,
  })

  useEffect(() => {
    if (isReady) return

    draftQuery.refetch().then(result => {
      if (result.data) {
        getInitialPrescription(result.data)
        setIsReady(true)
      } else {
        generateMutation.mutate()
      }
    }).catch(() => {
      generateMutation.mutate()
    })
  }, [consultationId])

  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-slate-500 font-medium">
          {generateMutation.isPending ? 'Generating AI Prescription...' : 'Loading...'}
        </div>
      </div>
    )
  }

  if (generateMutation.isError && !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 font-medium text-center">
          Failed to generate prescription.
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          className="h-9 px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md"
        >
          Generate
        </button>
      </div>
    )
  }

  return (
    <>
      <Prescription />
    </>
  )
}
