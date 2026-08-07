import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, ArrowLeftIcon, PrinterIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { useTargetedPrint } from '@/hooks/use-targeted-print'
import { useNoteImageUpload } from '@/hooks/use-note-image-upload'
import { useStableCallback } from '@/hooks/use-stable-callback'
import { fetchNoteImages, noteImagesForSubmit } from '@/lib/note-images'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ConsultationDetail } from '@/types/consultation'
import type { NoteImageType } from '@/types/prescription'
import type { PatientInfoType } from '@/types/patient'
import PrescriptionReadView, {
  type ClinicianProfile,
} from '@/components/prescription/paper/read-view'
import PrescriptionPrintView from '@/components/prescription/paper/print-view'
import ClinicalNotePrintView from '@/components/prescription/paper/clinical-note-print-view'
import ReadSkeleton from '@/components/prescription/paper/read-skeleton'
import ClinicalNotesPanel from '@/components/prescription/paper/clinical-notes-panel'
import PatientStrip from '@/components/prescription/paper/patient-strip'
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

// Signed photo URLs live behind their own endpoint, so a saved note's photos are fetched
// separately from the consultation itself.
function useNoteImages(prescriptionId: string, enabled: boolean) {
  return useQuery<NoteImageType[]>({
    queryKey: ['note-images', prescriptionId],
    queryFn:  () => fetchNoteImages(prescriptionId),
    enabled,
  })
}

function useSaveNoteImages(prescriptionId: string) {
  return useMutation({
    mutationFn: async (images: NoteImageType[]) => {
      await api.put(`/prescription/${prescriptionId}`, { note_images: noteImagesForSubmit(images) })
    },
    onError: () => toast.error('Failed to save photos'),
  })
}

interface ClinicalNotesTabProps {
  notes:       string | null
  safetyNet:   string[]
  patientSlot: React.ReactNode
  onChange:    (value: string) => void
  onPrint:     () => void
  onSave:      () => void
  isDirty:     boolean
  isSaving:    boolean
  images:          NoteImageType[]
  onAddImages:     (files: File[]) => void
  onRemoveImage:   (image: NoteImageType) => void
  uploadingImages: number
}

function ClinicalNotesTab({
  notes,
  safetyNet,
  patientSlot,
  onChange,
  onPrint,
  onSave,
  isDirty,
  isSaving,
  images,
  onAddImages,
  onRemoveImage,
  uploadingImages,
}: ClinicalNotesTabProps) {
  return (
    <>
      <ClinicalNotesPanel
        notes={notes}
        safetyNet={safetyNet}
        onChange={onChange}
        patientSlot={patientSlot}
        onPrint={onPrint}
        images={images}
        onAddImages={onAddImages}
        onRemoveImage={onRemoveImage}
        uploadingImages={uploadingImages}
      />
      {isDirty && (
        <div className="mx-auto flex w-full max-w-3xl justify-end px-4 mt-2">
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

function PrintButton({ onPrint, disabled }: { onPrint: () => void; disabled?: boolean }) {
  return (
    <Button size="sm" onClick={onPrint} disabled={disabled} className="gap-2">
      <PrinterIcon className="size-4" />
      Print
    </Button>
  )
}

function DetailToolbar({ onPrint, printDisabled }: { onPrint?: () => void; printDisabled?: boolean }) {
  return (
    <div className="container mx-auto flex items-center justify-between mt-4 mb-6 print:hidden">
      <BackButton />
      {onPrint && <PrintButton onPrint={onPrint} disabled={printDisabled} />}
    </div>
  )
}

function DetailError() {
  return (
    <>
      <DetailToolbar />
      <div className="container mx-auto flex flex-col items-center justify-center py-20 gap-4 text-center">
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
    </>
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

  // Photos save the moment they are added or removed — unlike the note text, there is
  // nothing to review before committing them.
  const storedImageCount = consultation?.prescription_data?.note_images?.length ?? 0
  const { data: signedImages } = useNoteImages(prescriptionId, storedImageCount > 0)
  const [imagesDraft, setImagesDraft] = useState<NoteImageType[] | null>(null)
  const noteImages = imagesDraft ?? signedImages ?? []
  const saveNoteImages = useSaveNoteImages(prescriptionId)

  const applyNoteImages = (next: NoteImageType[]) => {
    setImagesDraft(next)
    saveNoteImages.mutate(next)
  }

  // Stable callbacks so a second upload that finishes while the first is still in flight
  // appends to the list as it stands now, not as it stood when the pick started.
  const noteImageUpload = useNoteImageUpload({
    sessionId:  consultation?.session_id,
    current:    noteImages,
    onUploaded: useStableCallback((uploaded: NoteImageType[]) => applyNoteImages([...noteImages, ...uploaded])),
    onRemoved:  useStableCallback((image: NoteImageType) => applyNoteImages(noteImages.filter((i) => i.blob_name !== image.blob_name))),
  })

  const { printTarget, requestPrint } = useTargetedPrint({
    documentTitles: {
      prescription: `Prescription_${prescriptionId}`,
      note:         `Clinical_Note_${prescriptionId}`,
    },
  })

  if (isLoading) {
    return (
      <>
        <DetailToolbar onPrint={() => requestPrint('prescription')} printDisabled />
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
  const hasPrescription = consultation.includes_prescription !== false

  const patientStrip = (
    <PatientStrip
      name={consultation.patient_name}
      dateOfBirth={patient?.date_of_birth}
      sex={patient?.sex}
      dateTime={consultation.created_at}
    />
  )

  const clinicalNotesTab = (
    <ClinicalNotesTab
      notes={currentNotes}
      safetyNet={safetyNet}
      patientSlot={patientStrip}
      onChange={setNotesDraft}
      onPrint={() => requestPrint('note')}
      onSave={() => saveSummary.mutate(notesDraft ?? '')}
      isDirty={notesDirty}
      isSaving={saveSummary.isPending}
      images={noteImages}
      onAddImages={noteImageUpload.addImages}
      onRemoveImage={noteImageUpload.removeImage}
      uploadingImages={noteImageUpload.uploadingCount}
    />
  )

  return (
    <>
      {hasPrescription && (
        <div className={cn('rx-print-mount', printTarget !== 'prescription' && 'print:hidden')} aria-hidden>
          <PrescriptionPrintView
            consultation={consultation}
            clinician={clinician}
            patient={patient}
            audience="clinician"
          />
        </div>
      )}
      <div className={cn('rx-print-mount', printTarget !== 'note' && 'print:hidden')} aria-hidden>
        <ClinicalNotePrintView
          consultation={consultation}
          clinician={clinician}
          patient={patient}
          notes={currentNotes}
          images={noteImages}
        />
      </div>

      <div className="print:hidden">
        <DetailToolbar onPrint={() => requestPrint(hasPrescription ? 'prescription' : 'note')} />
        {hasPrescription ? (
          <DocumentSwitcher
            value={activeDocument}
            onValueChange={setActiveDocument}
            notesHasContent={!!savedNotes?.trim() || safetyNet.length > 0 || noteImages.length > 0}
            prescription={
              <PrescriptionReadView
                consultation={consultation}
                clinician={clinician}
                patient={patient}
              />
            }
            notes={clinicalNotesTab}
          />
        ) : (
          clinicalNotesTab
        )}
      </div>
    </>
  )
}
