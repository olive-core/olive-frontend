import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { PatientInfoType } from '@/types/patient'
import { PatientProfileForm } from '@/components/portal/patient-profile-form'

export const Route = createFileRoute('/portal/profile/edit')({
  component: PatientProfileEditPage,
})

function PatientProfileEditPage() {
  const userId = useAuthStore((state) => state.userId)

  const { data: patient, isLoading } = useQuery<PatientInfoType>({
    queryKey: ['patient', userId],
    queryFn:  async () => {
      const response = await api.get(`/patient/${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  if (isLoading || !patient) {
    return (
      <div className="h-full w-full flex items-center justify-center flex-col mt-12">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full w-full flex items-center justify-center flex-col mt-12">
      <PatientProfileForm patientData={patient} />
    </div>
  )
}
