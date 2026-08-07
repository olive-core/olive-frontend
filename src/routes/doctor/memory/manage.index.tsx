import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import MemoryEditor, { type MemoryPayload } from '@/components/memory/memory-editor'

export const Route = createFileRoute('/doctor/memory/manage/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()

  const createMemory = useMutation({
    mutationFn: async (payload: MemoryPayload) => {
      await api.post(`/prescription-template?clinician_id=${userId}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-library'] })
      navigate({ to: '/doctor/memory' })
    },
  })

  return (
    <MemoryEditor
      title="New memory"
      subtitle="Save the prescription for a case you see often"
      submitLabel="Create memory"
      submittingLabel="Creating..."
      isPending={createMemory.isPending}
      isError={createMemory.isError}
      onSubmit={(payload) => createMemory.mutate(payload)}
    />
  )
}
