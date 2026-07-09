import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { PatientInfoType } from '@/types/patient'
import { PatientProfileForm } from '@/components/patient/patient-profile-form'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/patient/profile/edit')({
  component: PatientProfileEditPage,
})

function FormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

function PatientProfileEditPage() {
  const activePatientId = useAuthStore((state) => state.activePatientId)

  const { data: patient, isLoading } = useQuery<PatientInfoType>({
    queryKey: ['patient', activePatientId],
    queryFn:  async () => {
      const response = await api.get(`/patient/${activePatientId}`)
      return response.data
    },
    enabled: !!activePatientId,
  })

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Edit profile</h1>

      {isLoading || !patient ? (
        <FormSkeleton />
      ) : (
        <PatientProfileForm patientData={patient} />
      )}
    </div>
  )
}
