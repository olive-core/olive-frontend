import { useQuery } from '@tanstack/react-query'
import { ProfileForm } from '@/components/clinician/profile-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'

export default function ProfileSection() {
  const { userId, phoneNumber } = useAuthStore()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['clinician', userId],
    queryFn: async () => (await api.get(`/clinician/${userId}`)).data,
    enabled: !!userId,
  })
  if (isPending) return <Skeleton className="h-96 w-full rounded-2xl" />
  if (isError || !data) return <div role="alert" className="rounded-xl border p-5 text-sm text-slate-600">Your profile couldn’t load.<Button variant="outline" className="ml-3" onClick={() => refetch()}>Try again</Button></div>
  return (
    <div className="space-y-5">
      <ProfileForm clinicianData={data} />
      <div className="rounded-xl border border-slate-200/80 px-6 py-5">
        <p className="text-sm font-medium text-slate-800">Account phone number</p>
        <p className="mt-1 text-sm text-slate-600">{phoneNumber || 'Not available'}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Used to sign in to Olive. This number can’t be changed here.</p>
      </div>
    </div>
  )
}
