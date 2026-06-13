import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/doctor/profile/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/doctor/profile/edit"!</div>
}
