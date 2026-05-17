import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, ArrowLeftIcon, PrinterIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import type { ConsultationDetail } from '@/types/consultation'
import type { PatientInfoType } from '@/types/patient'
import PrescriptionReadView, {
  type ClinicianProfile,
} from '@/components/prescription/paper/read-view'
import ReadSkeleton from '@/components/prescription/paper/read-skeleton'

export const Route = createFileRoute('/dashboard/consultations/$prescriptionId')({
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

function BackButton() {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate({ to: '/dashboard/consultations' })}
      className="text-slate-500 hover:text-slate-800 -ml-2"
    >
      <ArrowLeftIcon className="size-4 mr-1" />
      Back to consultations
    </Button>
  )
}

function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
      <PrinterIcon className="size-4" />
      Print
    </Button>
  )
}

function DetailToolbar() {
  return (
    <div className="container mx-auto flex items-center justify-between mt-4 print:hidden">
      <BackButton />
      <PrintButton />
    </div>
  )
}

function DetailError() {
  return (
    <div className="container mx-auto">
      <DetailToolbar />
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

  const [summaryText, setSummaryText] = useState<string | null>(null)
  const saveSummary = useSaveSummary(prescriptionId)

  const currentSummary = summaryText ?? (consultation?.prescription_data?.summary ?? null)

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

  return (
    <>
      <DetailToolbar />
      <PrescriptionReadView
        consultation={{ ...consultation, prescription_data: { ...consultation.prescription_data, summary: currentSummary } }}
        clinician={clinician}
        patient={patient}
        onSummaryChange={setSummaryText}
      />
      {summaryText !== null && summaryText !== (consultation.prescription_data?.summary ?? null) && (
        <div className="container mx-auto flex justify-end mt-2 print:hidden">
          <Button
            size="sm"
            onClick={() => saveSummary.mutate(summaryText)}
            disabled={saveSummary.isPending}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
          >
            {saveSummary.isPending ? 'Saving...' : 'Save Summary'}
          </Button>
        </div>
      )}
    </>
  )
}
