import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'

import { usePrescriptionStore } from '@/stores/prescription-store'
import ListInfo from '@/components/prescription/list-info'
import { MedicineContainer } from '@/components/prescription/medicine-container'
import AdviceList from '@/components/prescription/advice-list'
import FollowUpBlock from '@/components/prescription/paper/follow-up-block'
import { Button } from '@/components/ui/button'
import {
  filledMemorySections,
  memoryBodyFromSections,
  memorySectionLabel,
  memorySectionValues,
  type MemoryBody,
  type MemorySectionValues,
} from '@/lib/memory'

export interface MemoryPayload {
  template_name: string
  visibility: 'private'
  prescription_data: MemoryBody
}

export interface SavedMemory {
  template_name: string
  prescription_data: MemoryBody
}

interface MemoryEditorProps {
  title: string
  subtitle: string
  submitLabel: string
  submittingLabel: string
  initialData?: SavedMemory
  isLoadingData?: boolean
  isPending: boolean
  isError: boolean
  onSubmit: (payload: MemoryPayload) => void
}

export default function MemoryEditor({
  title,
  subtitle,
  submitLabel,
  submittingLabel,
  initialData,
  isLoadingData = false,
  isPending,
  isError,
  onSubmit,
}: MemoryEditorProps) {
  const navigate = useNavigate()

  const [memoryName, setMemoryName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    chiefComplaint, addEmptyChiefComplaint, updateChiefComplaint, removeChiefComplaint,
    history, addEmptyHistory, updateHistory, removeHistory,
    diagnosis, addEmptyDiagnosis, updateDiagnosis, removeDiagnosis,
    investigation, addEmptyInvestigation, updateInvestigation, removeInvestigation,
    medicine,
    advice, setAdvice,
    followUp, setFollowUp,
  } = usePrescriptionStore()

  // The prescription store is app-wide, so arriving here from a consultation carries that
  // draft's sections in with it. Clear on the way in as well as out, or a new memory
  // opens pre-filled with the last patient's medicines. Declared before the populate
  // effect below so a memory being edited isn't wiped on mount.
  useEffect(() => {
    const { resetStore } = usePrescriptionStore.getState()
    resetStore()
    return resetStore
  }, [])

  useEffect(() => {
    if (!initialData || isInitialized) return
    setMemoryName(initialData.template_name)
    usePrescriptionStore.setState(memorySectionValues(initialData.prescription_data))
    setIsInitialized(true)
  }, [initialData, isInitialized])

  const sections: MemorySectionValues = {
    chiefComplaint, history, diagnosis, investigation, medicine, advice, followUp,
  }
  const filledSections = filledMemorySections(sections)

  const handleSubmit = () => {
    if (!memoryName.trim()) {
      setValidationError('Give this memory a name')
      return
    }
    if (filledSections.length === 0) {
      setValidationError('Fill at least one section before saving')
      return
    }
    setValidationError(null)
    onSubmit({
      template_name: memoryName.trim(),
      visibility: 'private',
      prescription_data: memoryBodyFromSections(sections),
    })
  }

  if (isLoadingData) return <MemoryEditorSkeleton />

  return (
    <div className="container py-6 px-4 mx-auto max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/doctor/memory' })}
          className="cursor-pointer p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-xl border flex flex-col mb-12 bg-white">
        <div className="p-4 border-b">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 block">
            Memory name *
          </label>
          <input
            value={memoryName}
            onChange={(e) => { setMemoryName(e.target.value); setValidationError(null) }}
            placeholder="e.g. Type 2 diabetes — follow-up visit"
            className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <FilledSectionsLine sections={filledSections} />

        <div className="m-4">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="min-w-0 h-full lg:border-r lg:col-span-1 border-b lg:border-b-0 py-4 flex flex-col gap-2">
              <ListInfo
                title="Chief Complaints"
                info={chiefComplaint}
                fieldName="chief-complaint"
                addEmptyItem={addEmptyChiefComplaint}
                updateItem={updateChiefComplaint}
                removeItem={removeChiefComplaint}
              />
              <ListInfo
                title="History"
                info={history}
                fieldName="history"
                addEmptyItem={addEmptyHistory}
                updateItem={updateHistory}
                removeItem={removeHistory}
              />
              <ListInfo
                title="Diagnosis"
                info={diagnosis}
                fieldName="diagnosis"
                addEmptyItem={addEmptyDiagnosis}
                updateItem={updateDiagnosis}
                removeItem={removeDiagnosis}
              />
              <ListInfo
                title="Investigation"
                info={investigation}
                fieldName="investigation"
                addEmptyItem={addEmptyInvestigation}
                updateItem={updateInvestigation}
                removeItem={removeInvestigation}
              />
            </div>

            <div className="min-w-0 col-span-1 lg:col-span-2 py-4 px-4 lg:px-8 flex flex-col justify-between gap-4">
              <MedicineContainer />
              <div className="mt-auto flex flex-col gap-3">
                <AdviceList value={advice} onChange={setAdvice} />
                <FollowUpBlock value={followUp} onChange={setFollowUp} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-400">
            Fill only the sections this memory should carry. Blank ones are left alone when it is applied.
          </p>
          <Button onClick={handleSubmit} disabled={isPending} className="px-6 font-bold shadow-sm">
            <SaveIcon className="w-4 h-4" />
            {isPending ? submittingLabel : submitLabel}
          </Button>
        </div>
      </div>

      {(validationError || isError) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50">
          {validationError ?? 'Something went wrong. Please try again.'}
        </div>
      )}
    </div>
  )
}

// Not a control — it reflects what the doctor has written, so nothing is a surprise
// later when they apply the memory.
function FilledSectionsLine({ sections }: { sections: ReturnType<typeof filledMemorySections> }) {
  return (
    <div className="px-4 py-2.5 border-b bg-emerald-50/50 text-xs text-slate-600">
      {sections.length === 0 ? (
        'This memory is empty. Fill a section to save it.'
      ) : (
        <>
          This memory fills:{' '}
          <span className="font-semibold text-emerald-800">
            {sections.map(memorySectionLabel).join(' · ')}
          </span>
        </>
      )}
    </div>
  )
}

function MemoryEditorSkeleton() {
  return (
    <div className="container py-6 px-4 mx-auto max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="w-40 h-4 bg-slate-100 rounded-full animate-pulse" />
          <div className="w-56 h-3 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="rounded-xl border flex flex-col mb-12 bg-white animate-pulse">
        <div className="p-4 border-b flex gap-3">
          <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
          <div className="w-40 h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="m-4 h-64 bg-slate-50 rounded-xl" />
        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end">
          <div className="w-36 h-9 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
