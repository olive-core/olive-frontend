import { createFileRoute } from '@tanstack/react-router'
import AccountLayout from '@/components/dashboard/practice-account/account-layout'
import ConsultationSettingsCard from '@/components/clinician/consultation-settings-card'
import { useClinicianProfile } from '@/hooks/use-clinician-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/doctor/account/preferences')({ component: PreferencesPage })

function PreferencesPage() {
  const { data, isPending, isError, refetch } = useClinicianProfile()
  return (
    <AccountLayout section="preferences" title="Consultation preferences" description="Choose what Olive prepares after a consultation and how patients receive their prescriptions.">
      {isPending ? <Skeleton className="h-72 rounded-2xl" /> : isError || !data ? (
        <div role="alert" className="rounded-xl border p-5 text-sm">Your preferences couldn’t load.<Button className="ml-3" variant="outline" onClick={() => refetch()}>Try again</Button></div>
      ) : <div className="space-y-5">
        <ConsultationSettingsCard clinicianData={data} />
        <p className="px-1 text-xs text-slate-500">Changes save automatically.</p>
      </div>}
    </AccountLayout>
  )
}
