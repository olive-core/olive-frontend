import { ProfileForm } from '@/components/clinician/profile-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/profile/')({
  component: RouteComponent,
})

function RouteComponent() {


  return (
    <div className='h-full w-full flex items-center justify-center flex-col mt-12'>
      <ProfileForm />
    </div>
  )
}
