import { createFileRoute } from '@tanstack/react-router'
import MembershipPanel from '@/components/dashboard/subscription/membership-panel'
import AccountLayout from '@/components/dashboard/practice-account/account-layout'

export const Route = createFileRoute('/doctor/billing/')({ component: BillingPage })

function BillingPage() {
  return <AccountLayout section="membership" title="Membership" description="Your Olive membership, usage, and renewal."><MembershipPanel /></AccountLayout>
}
