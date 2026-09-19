import { createFileRoute } from '@tanstack/react-router'
import InsightsPage from '@/components/dashboard/insights/insights-page'

export const Route = createFileRoute('/doctor/insights/')({
  component: InsightsPage,
})
