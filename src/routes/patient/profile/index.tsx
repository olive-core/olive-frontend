import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { PatientInfoType } from '@/types/patient'
import { PatientProfileCard } from '@/components/patient/patient-profile-card'
import NumbersManager from '@/components/patient/numbers-manager'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/patient/profile/')({
  component: PatientProfilePage,
})

function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6">
        <Skeleton className="size-24 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="w-full space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PatientProfilePage() {
  const { activePatientId, phoneNumber } = useAuthStore()

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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profile</h1>

      {isLoading || !patient ? (
        <ProfileSkeleton />
      ) : (
        <>
          <PatientProfileCard patient={patient} phone={phoneNumber} />
          {activePatientId && <NumbersManager patientId={activePatientId} />}
        </>
      )}
    </div>
  )
}
