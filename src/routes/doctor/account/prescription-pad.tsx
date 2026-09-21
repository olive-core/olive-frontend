import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Stamp, Building2, UserRound } from 'lucide-react'
import AccountLayout from '@/components/dashboard/practice-account/account-layout'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/doctor/account/prescription-pad')({ component: PadSettingsPage })

function PadSettingsPage() {
  return (
    <AccountLayout section="pad" title="Prescription pad" description="A familiar identity on every prescription you hand to a patient.">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="bg-emerald-50/50 p-6 sm:p-8">
          <span className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-700"><Stamp className="size-6" strokeWidth={1.5} /></span>
          <h3 className="text-lg font-semibold text-slate-900">Your pad, your way</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">Preview your prescription as you adjust the layout, typography, and printed details for each chamber.</p>
          <Button asChild className="mt-6 min-h-11"><Link to="/doctor/prescription-header">Open pad editor<ArrowUpRight className="size-4" /></Link></Button>
        </div>
        <div className="divide-y divide-slate-100 px-6 sm:px-8">
          <Link to="/doctor/profile" className="flex items-center gap-3 py-5 text-sm text-slate-600 hover:text-emerald-700"><UserRound className="size-4 shrink-0" /><span className="flex-1">Edit your professional details</span><ArrowUpRight className="size-4" /></Link>
          <Link to="/doctor/chambers" className="flex items-center gap-3 py-5 text-sm text-slate-600 hover:text-emerald-700"><Building2 className="size-4 shrink-0" /><span className="flex-1">Manage chamber-specific pads</span><ArrowUpRight className="size-4" /></Link>
        </div>
      </div>
    </AccountLayout>
  )
}
