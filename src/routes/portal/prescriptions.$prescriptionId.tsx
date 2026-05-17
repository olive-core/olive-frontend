import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AlertCircleIcon, ArrowLeftIcon, PrinterIcon } from 'lucide-react'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import type { ConsultationDetail } from '@/types/consultation'
import type { PatientInfoType } from '@/types/patient'
import PrescriptionReadView, {
  type ClinicianProfile,
} from '@/components/prescription/paper/read-view'
import PrescriptionPrintView from '@/components/prescription/paper/print-view'
import ReadSkeleton from '@/components/prescription/paper/read-skeleton'

export const Route = createFileRoute('/portal/prescriptions/$prescriptionId')({
  component: PrescriptionDetailPage,
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

function BackButton() {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate({ to: '/portal' })}
      className="text-slate-500 hover:text-slate-800 -ml-2"
    >
      <ArrowLeftIcon className="size-4 mr-1" />
      Back to prescriptions
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
          <p className="text-slate-700 font-semibold text-lg">Failed to load prescription</p>
          <p className="text-slate-400 text-sm mt-1">
            The prescription may have been deleted, or there was a network error.
          </p>
        </div>
      </div>
    </div>
  )
}

function PrescriptionDetailPage() {
  const { prescriptionId } = Route.useParams()

  const { data: consultation, isLoading, isError } = useConsultation(prescriptionId)
  const { data: clinician } = useClinicianProfile(consultation?.clinician_id)
  const { data: patient }   = usePatient(consultation?.patient_id)

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
      <PrescriptionReadView
        consultation={consultation}
        clinician={clinician}
        patient={patient}
      />
    </>
  )
}
