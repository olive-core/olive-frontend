import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ConsultationDetail } from '@/types/consultation'
import type { PatientInfoType } from '@/types/patient'
import DetailView from '@/components/dashboard/consultations/detail/detail-view'
import DetailSkeleton from '@/components/dashboard/consultations/detail/detail-skeleton'
import DetailError from '@/components/dashboard/consultations/detail/detail-error'

export const Route = createFileRoute('/dashboard/consultations/$prescriptionId')({
  component: ConsultationDetailPage,
})

function useConsultationDetail(prescriptionId: string) {
  return useQuery<ConsultationDetail>({
    queryKey: ['consultation-detail', prescriptionId],
    queryFn:  async () => {
      const response = await api.get(`/prescription/${prescriptionId}`)
      return response.data
    },
  })
}

function usePatientInfo(patientId?: string) {
  return useQuery<PatientInfoType>({
    queryKey: ['patient-info', patientId],
    queryFn:  async () => {
      const response = await api.get(`/patient/${patientId}`)
      return response.data
    },
    enabled: !!patientId,
  })
}

function ConsultationDetailPage() {
  const { prescriptionId } = Route.useParams()

  const {
    data: consultation,
    isLoading: isLoadingConsultation,
    isError: isErrorConsultation,
  } = useConsultationDetail(prescriptionId)

  const { data: patient } = usePatientInfo(consultation?.patient_id)

  return (
    <div className="container py-8 px-4 mx-auto max-w-3xl">
      {isLoadingConsultation && <DetailSkeleton />}
      {!isLoadingConsultation && (isErrorConsultation || !consultation) && <DetailError />}
      {!isLoadingConsultation && consultation && (
        <DetailView consultation={consultation} patient={patient} />
      )}
    </div>
  )
}
