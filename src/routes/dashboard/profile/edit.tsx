import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/profile/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/profile/edit"!</div>
}
