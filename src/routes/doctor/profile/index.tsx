import { createFileRoute } from '@tanstack/react-router'
import AccountLayout from '@/components/dashboard/practice-account/account-layout'
import ProfileSection from '@/components/dashboard/practice-account/profile-section'

export const Route = createFileRoute('/doctor/profile/')({ component: ProfilePage })

function ProfilePage() {
  return <AccountLayout section="profile" title="Profile" description="Your personal and professional details, kept in sync with your prescription pad."><ProfileSection /></AccountLayout>
}
