import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import TemplateEditor, { type TemplatePayload } from '@/components/templates/template-editor'

export const Route = createFileRoute('/dashboard/templates/manage/')({
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
      navigate({ to: '/dashboard/templates' })
    },
  })

  return (
    <TemplateEditor
      title="New Template"
      subtitle="Build a reusable prescription template"
      submitLabel="Create Template"
      submittingLabel="Creating..."
      isPending={createMutation.isPending}
      isError={createMutation.isError}
      onSubmit={(payload) => createMutation.mutate(payload)}
    />
  )
}
