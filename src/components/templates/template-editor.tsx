import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePrescriptionStore } from '@/stores/prescription-store'
import ListInfo from '@/components/prescription/list-info'
import { MedicineContainer } from '@/components/prescription/medicine-container'
import AdviceList from '@/components/prescription/advice-list'
import { Button } from '@/components/ui/button'
import { isRxMemorySection } from '@/lib/rx-memory'
import { deserializeMedicine, serializeMedicine, type StoredRxItem } from '@/lib/rx-medicine'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

export type TemplatePrescriptionData = {
  chief_complaints: { ccn_id: string | null; name_text: string; duration: string; notes: string }[]
  histories: { hn_id: string | null; name_text: string; duration: string; notes: string }[]
  diagnoses: { dn_id: string | null; name_text: string; icd_code?: string; confidence?: number; clinical_reasoning?: string }[]
  on_examinations: any[]
  rx_list: StoredRxItem[]
  investigations: { investigation_name_id: string | null; name_text: string; reason: string; priority: string }[]
  advice_list: string[]
  follow_up_days: number
  follow_up_notes: string
}

export type TemplatePayload = {
  template_name: string
  visibility: 'private' | 'public'
  prescription_data: TemplatePrescriptionData
}

export type InitialTemplateData = {
  template_name: string
  visibility: string
  prescription_data: TemplatePrescriptionData
}

// ─── TemplateEditor Component ────────────────────────────────────────────────

interface TemplateEditorProps {
  title: string
  subtitle: string
  submitLabel: string
  submittingLabel: string
  initialData?: InitialTemplateData
  isLoadingData?: boolean
  isPending: boolean
  isError: boolean
  onSubmit: (payload: TemplatePayload) => void
}

export default function TemplateEditor({
  title,
  subtitle,
  submitLabel,
  submittingLabel,
  initialData,
  isLoadingData = false,
  isPending,
  isError,
  onSubmit,
}: TemplateEditorProps) {
  const navigate = useNavigate()

  const [templateName, setTemplateName] = useState('')
  const [nameError, setNameError] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const {
    chiefComplaint, addEmptyChiefComplaint, updateChiefComplaint, removeChiefComplaint,
    history, addEmptyHistory, updateHistory, removeHistory,
    diagnosis, addEmptyDiagnosis, updateDiagnosis, removeDiagnosis,
    investigation, addEmptyInvestigation, updateInvestigation, removeInvestigation,
    medicine,
    advice, setAdvice,
  } = usePrescriptionStore()

  // Populate store when initialData is loaded
  useEffect(() => {
    if (!initialData || initialized) return

    setTemplateName(initialData.template_name)

    const pd = initialData.prescription_data
    usePrescriptionStore.setState({
      chiefComplaint: (pd.chief_complaints ?? []).map(c => ({
        name: c.name_text,
        duration: c.duration ?? '',
        notes: c.notes ?? '',
      })),
      history: (pd.histories ?? []).map(h => ({
        name: h.name_text,
        duration: h.duration ?? '',
        notes: h.notes ?? '',
      })),
      diagnosis: (pd.diagnoses ?? []).map(d => ({
        name: d.name_text,
        icd_code: d.icd_code,
        confidence: d.confidence,
        clinical_reasoning: d.clinical_reasoning,
      })),
      investigation: (pd.investigations ?? []).map(i => ({
        name: i.name_text,
        notes: i.reason ?? '',
        priority: i.priority ?? 'routine',
      })),
      medicine: (pd.rx_list ?? []).map(deserializeMedicine),
      advice: pd.advice_list ?? [],
    })

    setInitialized(true)
  }, [initialData, initialized])

  // Reset store on unmount to avoid data bleeding into other pages
  useEffect(() => {
    return () => {
      usePrescriptionStore.setState({
        chiefComplaint: [],
        history: [],
        diagnosis: [],
        investigation: [],
        medicine: [],
        advice: [],
        summary: '',
      })
    }
  }, [])

  const buildPayload = (): TemplatePayload => ({
    template_name: templateName.trim(),
    visibility: 'private',
    prescription_data: {
      chief_complaints: chiefComplaint.map(item => ({
        ccn_id: null,
        name_text: item.name,
        duration: item.duration ?? '',
        notes: item.notes ?? '',
      })),
      histories: history.map(item => ({
        hn_id: null,
        name_text: item.name,
        duration: item.duration ?? '',
        notes: item.notes ?? '',
      })),
      diagnoses: diagnosis.map(item => ({
        dn_id: null,
        name_text: item.name,
        icd_code: item.icd_code ?? undefined,
        confidence: item.confidence ?? undefined,
        clinical_reasoning: item.clinical_reasoning ?? undefined,
      })),
      on_examinations: [],
      rx_list: medicine.map(serializeMedicine),
      investigations: investigation.map(item => ({
        investigation_name_id: null,
        name_text: item.name,
        reason: item.notes ?? '',
        priority: 'routine',
      })),
      advice_list: advice,
      follow_up_days: 0,
      follow_up_notes: '',
    },
  })

  const handleSubmit = () => {
    if (!templateName.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)
    onSubmit(buildPayload())
  }

  if (isLoadingData) {
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

  return (
    <div className="container py-6 px-4 mx-auto max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/doctor/rx-memory' })}
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
        {/* RxMemory name */}
        <div className="p-4 border-b">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 block">
            RxMemory name *
          </label>
          <input
            value={templateName}
            onChange={(e) => { setTemplateName(e.target.value); setNameError(false) }}
            placeholder="e.g. URTI Protocol, Hypertension Starter..."
            className={`w-full h-10 px-3 text-sm border rounded-xl shadow-sm outline-none focus:ring-2 transition-all ${nameError
              ? 'border-red-400 focus:ring-red-200'
              : 'border-slate-200 focus:ring-emerald-500/20'
              }`}
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1">RxMemory name is required</p>
          )}
        </div>

        {/* Main editor */}
        <div className="m-4">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left column */}
            <div className="h-full md:border-r md:col-span-1 border-b md:border-b-0 py-4 flex flex-col gap-2">
              {isRxMemorySection("chief-complaint") && (
                <ListInfo
                  title="Chief Complaints"
                  info={chiefComplaint}
                  fieldName="chief-complaint"
                  addEmptyItem={addEmptyChiefComplaint}
                  updateItem={updateChiefComplaint}
                  removeItem={removeChiefComplaint}
                />
              )}
              {isRxMemorySection("history") && (
                <ListInfo
                  title="History"
                  info={history}
                  fieldName="history"
                  addEmptyItem={addEmptyHistory}
                  updateItem={updateHistory}
                  removeItem={removeHistory}
                />
              )}
              {isRxMemorySection("diagnosis") && (
                <ListInfo
                  title="Diagnosis"
                  info={diagnosis}
                  fieldName="diagnosis"
                  addEmptyItem={addEmptyDiagnosis}
                  updateItem={updateDiagnosis}
                  removeItem={removeDiagnosis}
                />
              )}
              {isRxMemorySection("investigation") && (
                <ListInfo
                  title="Investigation"
                  info={investigation}
                  fieldName="investigation"
                  addEmptyItem={addEmptyInvestigation}
                  updateItem={updateInvestigation}
                  removeItem={removeInvestigation}
                />
              )}
            </div>

            {/* Right column */}
            <div className="col-span-1 md:col-span-2 py-4 px-4 md:px-8 flex flex-col justify-between gap-4">
              {isRxMemorySection("medicine") && <MedicineContainer />}
              {isRxMemorySection("advice") && (
                <div className="mt-auto">
                  <AdviceList value={advice} onChange={setAdvice} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 rounded-b-xl">
          <p className="text-xs text-slate-400">
            All fields are optional except the RxMemory name.
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 font-bold shadow-sm"
          >
            <SaveIcon className="w-4 h-4" />
            {isPending ? submittingLabel : submitLabel}
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50">
          Something went wrong. Please try again.
        </div>
      )}
    </div>
  )
}
