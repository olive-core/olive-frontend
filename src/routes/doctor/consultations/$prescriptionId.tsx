import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisIcon, HistoryIcon, PrinterIcon, Share2Icon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { useTargetedPrint } from '@/hooks/use-targeted-print'
import { useNoteImageUpload } from '@/hooks/use-note-image-upload'
import { useStableCallback } from '@/hooks/use-stable-callback'
import { useStartConsultation } from '@/hooks/use-start-consultation'
import { fetchNoteImages, noteImagesForSubmit } from '@/lib/note-images'
import { cn } from '@/lib/utils'
import { parseSoapSections } from '@/lib/soap-notes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import CaseShareDialog from '@/components/consultation/case-share-button'

export const Route = createFileRoute('/doctor/consultations/$prescriptionId')({
  validateSearch: (search: Record<string, unknown>) => ({
    document: search.document === 'notes' ? 'notes' as const : undefined,
  }),
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
      const sections = parseSoapSections(summary)
      const section = (key: string) => sections?.find((item) => item.key === key)?.text ?? ''
      await api.put(`/prescription/${prescriptionId}`, {
        summary,
        clinical_note: sections
          ? {
              subjective: section('S'),
              objective: section('O'),
              assessment: section('A'),
              plan: section('P'),
            }
          : null,
      })
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
  onChange?:   (value: string) => void
  onPrint:     () => void
  onSave?:     () => void
  isDirty:     boolean
  isSaving:    boolean
  images:          NoteImageType[]
  onAddImages?:    (files: File[]) => void
  onRemoveImage?:  (image: NoteImageType) => void
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
      {isDirty && onSave && (
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

function ConsultationSeriesNavigation({
  previousPrescriptionId,
  nextPrescriptionId,
  activeDocument,
}: {
  previousPrescriptionId?: string | null
  nextPrescriptionId?: string | null
  activeDocument: PrescriptionDocument
}) {
  const navigate = useNavigate()
  if (!previousPrescriptionId && !nextPrescriptionId) return null

  const openConsultation = (prescriptionId: string) => navigate({
    to: '/doctor/consultations/$prescriptionId',
    params: { prescriptionId },
    search: { document: activeDocument === 'notes' ? 'notes' : undefined },
  })

  return (
    <div className="mx-auto mb-4 w-full max-w-xl px-4">
      <div className="flex items-center justify-between gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <Button variant="ghost" size="sm" disabled={!previousPrescriptionId} onClick={() => previousPrescriptionId && openConsultation(previousPrescriptionId)}>
          <ChevronLeftIcon className="size-4 sm:mr-1" />
          <span className="hidden sm:inline">Earlier</span>
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <HistoryIcon className="size-3.5" /> Follow-up series
        </span>
        <Button variant="ghost" size="sm" disabled={!nextPrescriptionId} onClick={() => nextPrescriptionId && openConsultation(nextPrescriptionId)}>
          <span className="hidden sm:inline">Later</span>
          <ChevronRightIcon className="size-4 sm:ml-1" />
        </Button>
      </div>
    </div>
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
      Consultations
    </Button>
  )
}

function DetailToolbar({
  onPrint,
  printDisabled,
  followUpAction,
  onShare,
  sharedLabel,
}: {
  onPrint?: () => void
  printDisabled?: boolean
  followUpAction?: React.ReactNode
  onShare?: () => void
  sharedLabel?: boolean
}) {
  return (
    <div className="container mx-auto mt-4 mb-6 flex flex-wrap items-center justify-between gap-2 px-4 print:hidden">
      <BackButton />
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {sharedLabel && (
          <span className="inline-flex h-8 items-center rounded-full bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
            Shared case
          </span>
        )}
        {followUpAction}
        {(onShare || onPrint) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="More consultation actions">
                <EllipsisIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {onShare && (
                <DropdownMenuItem onSelect={onShare}>
                  <Share2Icon className="size-4" /> Share case
                </DropdownMenuItem>
              )}
              {onPrint && (
                <DropdownMenuItem onSelect={onPrint} disabled={printDisabled}>
                  <PrinterIcon className="size-4" /> Print
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
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
  return <ConsultationDetailContent key={prescriptionId} prescriptionId={prescriptionId} />
}

function ConsultationDetailContent({ prescriptionId }: { prescriptionId: string }) {
  const search = Route.useSearch()

  const { data: consultation, isLoading, isError } = useConsultation(prescriptionId)
  const { data: clinician } = useClinicianProfile(consultation?.clinician_id)
  const { data: patient }   = usePatient(consultation?.patient_id)

  const { start, startingSourceSessionId, graceDialog } = useStartConsultation()
  const [activeDocument, setActiveDocument] = useState<PrescriptionDocument>(
    search.document === 'notes' ? 'notes' : 'prescription'
  )
  const [notesDraft, setNotesDraft] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
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
        <DetailToolbar />
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
  const isShared = consultation.access_type === 'shared'

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
      onChange={isShared ? undefined : setNotesDraft}
      onPrint={() => requestPrint('note')}
      onSave={isShared ? undefined : () => saveSummary.mutate(notesDraft ?? '')}
      isDirty={notesDirty}
      isSaving={saveSummary.isPending}
      images={noteImages}
      onAddImages={isShared ? undefined : noteImageUpload.addImages}
      onRemoveImage={isShared ? undefined : noteImageUpload.removeImage}
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
        <DetailToolbar
          onPrint={() => requestPrint(hasPrescription ? 'prescription' : 'note')}
          sharedLabel={isShared}
          onShare={!isShared ? () => setShareDialogOpen(true) : undefined}
          followUpAction={!isShared && consultation.session_id && !consultation.has_follow_up ? (
            <Button
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              isLoading={startingSourceSessionId === consultation.session_id}
              disabled={!!startingSourceSessionId}
              onClick={() => start(consultation.patient_id, undefined, consultation.session_id!)}
            >
              <HistoryIcon className="size-4" /> Follow up
            </Button>
          ) : undefined}
        />
        <ConsultationSeriesNavigation
          previousPrescriptionId={consultation.previous_prescription_id}
          nextPrescriptionId={consultation.next_prescription_id}
          activeDocument={activeDocument}
        />
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
      {!isShared && (
        <CaseShareDialog
          prescriptionId={prescriptionId}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
      {graceDialog}
    </>
  )
}
