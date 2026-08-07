import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import MemoryEditor, { type MemoryPayload, type SavedMemory } from '@/components/memory/memory-editor'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/doctor/memory/manage/$memoryId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { memoryId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()

  const { data: memory, isLoading, isError } = useQuery<SavedMemory>({
    queryKey: ['memory', memoryId],
    queryFn: async () => {
      const res = await api.get(`/prescription-template/${memoryId}`)
      return res.data
    },
  })

  const updateMemory = useMutation({
    mutationFn: async (payload: MemoryPayload) => {
      await api.put(`/prescription-template/${memoryId}?clinician_id=${userId}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-library'] })
      queryClient.invalidateQueries({ queryKey: ['memory', memoryId] })
      navigate({ to: '/doctor/memory' })
    },
  })

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-500 font-medium">Failed to load this memory.</p>
        <Button variant="outline" onClick={() => navigate({ to: '/doctor/memory' })}>
          Back to Memory
        </Button>
      </div>
    )
  }

  return (
    <MemoryEditor
      title="Edit memory"
      subtitle="Update what this memory carries"
      submitLabel="Save changes"
      submittingLabel="Saving..."
      initialData={memory}
      isLoadingData={isLoading}
      isPending={updateMemory.isPending}
      isError={updateMemory.isError}
      onSubmit={(payload) => updateMemory.mutate(payload)}
    />
  )
}
