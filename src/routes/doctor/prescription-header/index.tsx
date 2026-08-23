import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { handleError } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import {
  chamberIdFromSection,
  parsePadSectionId,
  useHeaderConfigStore,
  type PadSectionId,
} from '@/stores/header-config-store'
import type { ClinicianHeaderUpdate } from '@/lib/header-config'
import HeaderEditor, { type HeaderEditorProfile } from '@/components/prescription/header/editor/header-editor'

interface PadEditorSearch {
  section?: PadSectionId
}

// Other pages deep-link here (e.g. the Chambers page opens a specific chamber's pad).
export const Route = createFileRoute('/doctor/prescription-header/')({
  validateSearch: (search: Record<string, unknown>): PadEditorSearch => ({
    section: parsePadSectionId(search.section),
  }),
  component: PrescriptionHeaderPage,
})

function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[860px] px-4 py-6">
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
  const storeClinicianInfo = useAuthStore((state) => state.storeClinicianInfo)
  const queryClient = useQueryClient()
  const { section } = Route.useSearch()

  // Applies the deep-link target: open the requested section and, for a chamber, preview
  // the letterhead as that chamber.
  useEffect(() => {
    if (!section) return
    const store = useHeaderConfigStore.getState()
    store.setOpenSection(section)
    const chamberId = chamberIdFromSection(section)
    if (chamberId) store.setPreviewChamber(chamberId)
  }, [section])

  const { data: profile, isLoading } = useQuery<HeaderEditorProfile>({
    queryKey: ['clinician', userId],
    queryFn: async () => (await api.get(`/clinician/${userId}`)).data,
    enabled: !!userId,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: ClinicianHeaderUpdate) => api.put(`/clinician/${userId}`, payload),
    onSuccess: (_response, payload) => {
      // The session is never re-fetched on its own (doctors stay logged in), so the
      // cached identity in auth-store is refreshed here to match what was just saved.
      storeClinicianInfo({
        name: payload.name,
        qualification: payload.qualification,
        specializations: payload.specializations,
        bmdcNo: payload.bmdc_no,
      })
      queryClient.invalidateQueries({ queryKey: ['clinician', userId] })
      queryClient.invalidateQueries({ queryKey: ['clinician-profile', userId] })
      toast.success('Prescription pad saved')
    },
    onError: (error) => handleError(error, 'Failed to save prescription pad'),
  })

  if (!userId || isLoading || !profile) {
    return <EditorSkeleton />
  }

  return (
    <HeaderEditor
      initialProfile={profile}
      isSaving={saveMutation.isPending}
      onSave={(payload) => saveMutation.mutate(payload)}
    />
  )
}
