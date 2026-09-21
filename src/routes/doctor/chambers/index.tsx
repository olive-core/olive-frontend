import { createFileRoute } from '@tanstack/react-router'
import ChambersManager from '@/components/dashboard/chambers/chambers-manager'
import AccountLayout from '@/components/dashboard/practice-account/account-layout'

export const Route = createFileRoute('/doctor/chambers/')({ component: ChambersPage })

function ChambersPage() {
  return <AccountLayout section="chambers" title="Chambers & attendants" description="Manage the places you practise and the attendants who register your patient queue."><ChambersManager embedded /></AccountLayout>
}
