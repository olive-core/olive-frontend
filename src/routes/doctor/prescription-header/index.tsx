import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { handleError } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useHeaderConfigStore, type EditorTab } from '@/stores/header-config-store'
import type { ClinicianHeaderUpdate } from '@/lib/header-config'
import HeaderEditor, { type HeaderEditorProfile } from '@/components/prescription/header/editor/header-editor'

const EDITOR_TABS: EditorTab[] = ['style', 'doctor', 'chambers', 'footer']

interface PadEditorSearch {
  tab?:     EditorTab
  chamber?: string
}

// Other pages deep-link here (e.g. the Chambers page opens a specific chamber's pad).
export const Route = createFileRoute('/doctor/prescription-header/')({
  validateSearch: (search: Record<string, unknown>): PadEditorSearch => ({
    tab:     EDITOR_TABS.includes(search.tab as EditorTab) ? (search.tab as EditorTab) : undefined,
    chamber: typeof search.chamber === 'string' ? search.chamber : undefined,
  }),
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
  const storeClinicianInfo = useAuthStore((state) => state.storeClinicianInfo)
  const queryClient = useQueryClient()
  const { tab, chamber } = Route.useSearch()

  // Applies the deep-link target: switch to the requested tab and, for a chamber link,
  // open that chamber's pad accordion and preview the letterhead as that chamber.
  useEffect(() => {
    const store = useHeaderConfigStore.getState()
    if (tab) store.setActiveTab(tab)
    if (chamber) {
      store.setOpenPadId(chamber)
      store.setPreviewChamber(chamber)
    }
  }, [tab, chamber])

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
