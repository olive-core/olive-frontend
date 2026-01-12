import Prescription from '@/components/prescription'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';

export const Route = createFileRoute('/dashboard/prescribe/$consultationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { consultationId } = Route.useParams();

  const { getInitialPrescription } = usePrescriptionStore();

  useEffect(() => {
    getInitialPrescription(consultationId)
  }, [consultationId, getInitialPrescription])

  return (
    <div>
      <Prescription />
    </div>
  )
}
