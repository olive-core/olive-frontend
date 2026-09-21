import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'

export default function DraftingPreference({ enabled, prescriptionsEnabled, embedded = false }: { enabled: boolean; prescriptionsEnabled: boolean; embedded?: boolean }) {
  const { userId, storeClinicianInfo } = useAuthStore()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (value: boolean) => api.put(`/clinician/${userId}`, { generate_ai_draft: value }),
    onSuccess: (_response, value) => {
      storeClinicianInfo({ generate_ai_draft: value })
      queryClient.invalidateQueries({ queryKey: ['clinician', userId] })
      toast.success('Drafting preference updated')
    },
    onError: () => toast.error('Could not update drafting preference'),
  })
  const content = (
      <div className="flex items-start justify-between gap-5">
        <div>
          <h3 id="drafting-label" className="text-sm font-semibold text-slate-900">Auto-generate prescription draft</h3>
          <p id="drafting-description" className="mt-1 text-sm leading-relaxed text-slate-500">Draft a prescription automatically after each recording. You review it before finalizing.</p>
          {!prescriptionsEnabled && <p className="mt-3 text-xs leading-relaxed text-amber-700">This preference takes effect when prescription writing is enabled.</p>}
        </div>
        <button type="button" role="switch" aria-labelledby="drafting-label" aria-describedby="drafting-description" aria-checked={enabled}
          disabled={mutation.isPending || !prescriptionsEnabled} onClick={() => mutation.mutate(!enabled)}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50">
          <span className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`size-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${enabled ? 'translate-x-5' : ''}`} /></span>
        </button>
      </div>
  )
  return embedded ? content : <Card className="border-slate-200/80 shadow-none"><CardContent>{content}</CardContent></Card>
}
