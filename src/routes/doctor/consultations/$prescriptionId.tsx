import { createFileRoute } from '@tanstack/react-router'
import ConsultationDetailContent from '@/components/consultation/consultation-detail'

export const Route = createFileRoute('/doctor/consultations/$prescriptionId')({
  validateSearch: (search: Record<string, unknown>) => ({
    document: search.document === 'notes' ? 'notes' as const : undefined,
  }),
  component: ConsultationDetailPage,
})

function ConsultationDetailPage() {
  const { prescriptionId } = Route.useParams()
  const { document } = Route.useSearch()
  return <ConsultationDetailContent key={prescriptionId} prescriptionId={prescriptionId} initialDocument={document} />
}
