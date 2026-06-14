import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import TemplateEditor, { type TemplatePayload, type InitialTemplateData } from '@/components/templates/template-editor'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/doctor/rx-memory/manage/$templateId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { templateId } = Route.useParams()
  const navigate = useNavigate()
  const { userId } = useAuthStore()

  const { data: template, isLoading, isError: fetchError } = useQuery<InitialTemplateData>({
    queryKey: ['prescription-template', templateId],
    queryFn: async () => {
      const res = await api.get(`/prescription-template/${templateId}`)
      return res.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: TemplatePayload) => {
      await api.put(
        `/prescription-template/${templateId}?clinician_id=${userId}`,
        payload,
      )
    },
    onSuccess: () => {
      navigate({ to: '/doctor/rx-memory' })
    },
  })

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-500 font-medium">Failed to load RxMemory.</p>
        <Button variant="outline" onClick={() => navigate({ to: '/doctor/rx-memory' })}>
          Back to RxMemory
        </Button>
      </div>
    )
  }

  return (
    <TemplateEditor
      title="Edit RxMemory"
      subtitle="Update your saved RxMemory"
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      initialData={template}
      isLoadingData={isLoading}
      isPending={updateMutation.isPending}
      isError={updateMutation.isError}
      onSubmit={(payload) => updateMutation.mutate(payload)}
    />
  )
}
