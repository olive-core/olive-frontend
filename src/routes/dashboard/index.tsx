import { createFileRoute } from '@tanstack/react-router'
import WelcomeScreen from "@/components/dashboard/welcome-screen";

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="">
      <WelcomeScreen />
    </div>
  )
}