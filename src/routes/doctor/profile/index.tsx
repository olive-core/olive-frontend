import { ProfileForm } from '@/components/clinician/profile-form'
import { ProfileSummary } from '@/components/clinician/profile-summary'
import MembershipBadge from '@/components/dashboard/subscription/membership-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/doctor/profile/')({
  component: RouteComponent,
})

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RouteComponent() {
  const { userId, phoneNumber } = useAuthStore()

  const { data: clinicianData, isLoading } = useQuery({
    queryKey: ['clinician', userId],
    queryFn: async () => {
      const response = await api.get(`/clinician/${userId}`)
      return response.data
    },
  })

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profile</h1>

      <MembershipBadge />

      {isLoading || !clinicianData ? (
        <ProfileSkeleton />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <ProfileSummary
              firstName={clinicianData.first_name}
              lastName={clinicianData.last_name}
              qualification={clinicianData.qualification}
              specializations={clinicianData.specializations}
              bmdcNo={clinicianData.bmdc_no}
              phone={phoneNumber}
            />
          </div>
          <div className="md:col-span-2">
            <ProfileForm clinicianData={clinicianData} />
          </div>
        </div>
      )}
    </div>
  )
}
