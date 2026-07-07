import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { handleError } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import type { ClinicianHeaderUpdate } from '@/lib/header-config'
import HeaderEditor, { type HeaderEditorProfile } from '@/components/prescription/header/editor/header-editor'

export const Route = createFileRoute('/doctor/prescription-header/')({
  component: PrescriptionHeaderPage,
})

function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-6">
      <div className="mb-4 h-10 w-64 animate-pulse rounded-lg bg-slate-100" />
      <div className="mb-5 h-48 animate-pulse rounded-xl bg-slate-100" />
      <div className="flex flex-col gap-3">
        <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

function PrescriptionHeaderPage() {
  const userId = useAuthStore((state) => state.userId)
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery<HeaderEditorProfile>({
    queryKey: ['clinician', userId],
    queryFn: async () => (await api.get(`/clinician/${userId}`)).data,
    enabled: !!userId,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: ClinicianHeaderUpdate) => api.put(`/clinician/${userId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinician', userId] })
      queryClient.invalidateQueries({ queryKey: ['clinician-profile', userId] })
      toast.success('Prescription header saved')
    },
    onError: (error) => handleError(error, 'Failed to save header'),
  })

  if (!userId || isLoading || !profile) {
    return <EditorSkeleton />
  }

  return (
    <HeaderEditor
      userId={userId}
      initialProfile={profile}
      isSaving={saveMutation.isPending}
      onSave={(payload) => saveMutation.mutate(payload)}
    />
  )
}
