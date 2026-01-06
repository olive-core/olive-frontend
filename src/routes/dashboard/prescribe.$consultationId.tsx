import Prescription from '@/components/prescription'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/prescribe/$consultationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Prescription />
    </div>
  )
}
