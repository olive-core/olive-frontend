import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, ArrowLeftIcon, PrinterIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import type { ConsultationDetail } from '@/types/consultation'
import type { PatientInfoType } from '@/types/patient'
import PrescriptionReadView, {
  type ClinicianProfile,
} from '@/components/prescription/paper/read-view'
import PrescriptionPrintView from '@/components/prescription/paper/print-view'
import ReadSkeleton from '@/components/prescription/paper/read-skeleton'
import ClinicalNotesPanel from '@/components/prescription/paper/clinical-notes-panel'
import DocumentSwitcher, {
  type PrescriptionDocument,
} from '@/components/prescription/document-switcher'

export const Route = createFileRoute('/doctor/consultations/$prescriptionId')({
  component: ConsultationDetailPage,
})

function useConsultation(prescriptionId: string) {
  return useQuery<ConsultationDetail>({
    queryKey: ['consultation-detail', prescriptionId],
    queryFn:  async () => {
      const response = await api.get(`/prescription/${prescriptionId}`)
      return response.data
    },
  })
}

function useClinicianProfile(clinicianId?: string) {
  return useQuery<ClinicianProfile>({
    queryKey: ['clinician-profile', clinicianId],
    queryFn:  async () => {
      const response = await api.get(`/clinician/${clinicianId}`)
      return response.data
    },
    enabled: !!clinicianId,
  })
}

function usePatient(patientId?: string) {
  return useQuery<PatientInfoType>({
    queryKey: ['patient-info', patientId],
    queryFn:  async () => {
      const response = await api.get(`/patient/${patientId}`)
      return response.data
    },
    enabled: !!patientId,
  })
}

function useSaveSummary(prescriptionId: string) {
  return useMutation({
    mutationFn: async (summary: string) => {
      await api.put(`/prescription/${prescriptionId}`, { summary })
    },
    onSuccess: () => toast.success('Summary saved'),
    onError:   () => toast.error('Failed to save summary'),
  })
}

interface ClinicalNotesTabProps {
  notes:     string | null
  safetyNet: string[]
  onChange:  (value: string) => void
  onSave:    () => void
  isDirty:   boolean
  isSaving:  boolean
}

function ClinicalNotesTab({ notes, safetyNet, onChange, onSave, isDirty, isSaving }: ClinicalNotesTabProps) {
  return (
    <>
      <ClinicalNotesPanel notes={notes} safetyNet={safetyNet} onChange={onChange} />
      {isDirty && (
        <div className="container mx-auto flex justify-end mt-2">
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      )}
    </>
  )
}

function BackButton() {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate({ to: '/doctor/consultations' })}
      className="text-slate-500 hover:text-slate-800 -ml-2"
    >
      <ArrowLeftIcon className="size-4 mr-1" />
      Back to consultations
    </Button>
  )
}

function PrintButton({ onPrint }: { onPrint: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onPrint} className="gap-2">
      <PrinterIcon className="size-4" />
      Print
    </Button>
  )
}

function DetailToolbar({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="container mx-auto flex items-center justify-between mt-4 print:hidden">
      <BackButton />
      <PrintButton onPrint={onPrint} />
    </div>
  )
}

function DetailError() {
  return (
    <div className="container mx-auto">
      <DetailToolbar onPrint={() => {}} />
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircleIcon className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-lg">Failed to load consultation</p>
          <p className="text-slate-400 text-sm mt-1">
            The consultation may have been deleted, or there was a network error.
          </p>
        </div>
      </div>
    </div>
  )
}

function ConsultationDetailPage() {
  const { prescriptionId } = Route.useParams()

  const { data: consultation, isLoading, isError } = useConsultation(prescriptionId)
  const { data: clinician } = useClinicianProfile(consultation?.clinician_id)
  const { data: patient }   = usePatient(consultation?.patient_id)

  const [activeDocument, setActiveDocument] = useState<PrescriptionDocument>('prescription')
  const [notesDraft, setNotesDraft] = useState<string | null>(null)
  const saveSummary = useSaveSummary(prescriptionId)

  const printRef = useRef(null)
  const handlePrint = useReactToPrint({
    contentRef:    printRef,
    documentTitle: `Prescription_${prescriptionId}`,
  })

  if (isLoading) {
    return (
      <>
        <DetailToolbar onPrint={handlePrint} />
        <ReadSkeleton />
      </>
    )
  }

  if (isError || !consultation) {
    return <DetailError />
  }

  const savedNotes = consultation.prescription_data?.summary ?? null
  const safetyNet = consultation.prescription_data?.safety_net ?? []
  const currentNotes = notesDraft ?? savedNotes
  const notesDirty = notesDraft !== null && notesDraft !== savedNotes

  return (
    <>
      <div className="fixed top-0 left-[-9999px] print:left-0 print:block" ref={printRef}>
        <PrescriptionPrintView
          consultation={consultation}
          clinician={clinician}
          patient={patient}
        />
      </div>

      <DetailToolbar onPrint={handlePrint} />
      <DocumentSwitcher
        value={activeDocument}
        onValueChange={setActiveDocument}
        notesHasContent={!!savedNotes?.trim() || safetyNet.length > 0}
        prescription={
          <PrescriptionReadView
            consultation={consultation}
            clinician={clinician}
            patient={patient}
          />
        }
        notes={
          <ClinicalNotesTab
            notes={currentNotes}
            safetyNet={safetyNet}
            onChange={setNotesDraft}
            onSave={() => saveSummary.mutate(notesDraft ?? '')}
            isDirty={notesDirty}
            isSaving={saveSummary.isPending}
          />
        }
      />
    </>
  )
}
