import { ProfileForm } from '@/components/clinician/profile-form'
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { Loader2Icon } from 'lucide-react';

export const Route = createFileRoute('/doctor/profile/')({
  component: RouteComponent,
})

function RouteComponent() {

  const { userId } = useAuthStore();

  const { data: clinicianData, isLoading } = useQuery({
    queryKey: ["clinician", userId],
    queryFn: async () => {
      const response = await api.get(`/clinician/${userId}`);
      return response.data
    }
  })

  if (isLoading) {
    return <div className='h-full w-full flex items-center justify-center flex-col mt-12'>
      <Loader2Icon className='h-8 w-8 animate-spin' />
    </div>
  }

  return (
    <div className='h-full w-full flex items-center justify-center flex-col mt-12'>
      <ProfileForm clinicianData={clinicianData} />
    </div>
  )
}
