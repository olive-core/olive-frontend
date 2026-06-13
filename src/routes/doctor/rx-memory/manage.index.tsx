import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import TemplateEditor, { type TemplatePayload } from '@/components/templates/template-editor'

export const Route = createFileRoute('/doctor/rx-memory/manage/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { userId } = useAuthStore()

  const createMutation = useMutation({
    mutationFn: async (payload: TemplatePayload) => {
      await api.post(`/prescription-template?clinician_id=${userId}`, payload)
    },
    onSuccess: () => {
      navigate({ to: '/doctor/rx-memory' })
    },
  })

  return (
    <TemplateEditor
      title="New RxMemory"
      subtitle="Build a reusable RxMemory"
      submitLabel="Create RxMemory"
      submittingLabel="Creating..."
      isPending={createMutation.isPending}
      isError={createMutation.isError}
      onSubmit={(payload) => createMutation.mutate(payload)}
    />
  )
}
