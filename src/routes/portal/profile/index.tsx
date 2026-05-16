import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2Icon, PencilIcon } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { PatientInfoType } from '@/types/patient'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/portal/profile/')({
  component: PatientProfilePage,
})

const SEX_LABELS: Record<string, string> = {
  male:       'Male',
  female:     'Female',
  non_binary: 'Non-binary',
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-none">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
    </div>
  )
}

function PatientProfilePage() {
  const userId = useAuthStore((state) => state.userId)

  const { data: patient, isLoading } = useQuery<PatientInfoType>({
    queryKey: ['patient', userId],
    queryFn:  async () => {
      const response = await api.get(`/patient/${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center flex-col mt-12">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full w-full flex items-center justify-center flex-col mt-12">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileRow label="First Name" value={patient?.first_name} />
          <ProfileRow label="Last Name" value={patient?.last_name} />
          <ProfileRow label="Date of Birth" value={patient?.date_of_birth} />
          <ProfileRow label="Sex" value={patient?.sex ? SEX_LABELS[patient.sex] : undefined} />

          <Link to="/portal/profile/edit" className="block mt-6">
            <Button className="w-full gap-2">
              <PencilIcon className="size-4" />
              Edit Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
