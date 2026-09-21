import { BookMarked, ChartNoAxesColumn, ChevronDown, ClipboardList, CreditCard, House, LogOut, Settings2 } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import NavbarLogo from '@/components/shared/navbar-logo'
import SubscriptionStatusPill from './subscription/status-pill'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth-store'
import { withDoctorFirstName, withDoctorPrefix } from '@/lib/clinician'
import { cn } from '@/lib/utils'

const CLINICAL_LINKS = [
  { label: 'Home', to: '/doctor', icon: House },
  { label: 'Consultations', to: '/doctor/consultations', icon: ClipboardList },
  { label: 'Memory', to: '/doctor/memory', icon: BookMarked },
  { label: 'Insights', to: '/doctor/insights', icon: ChartNoAxesColumn },
] as const

function ClinicalLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = useLocation({ select: (location) => location.pathname })
  return (
    <nav aria-label={mobile ? 'Clinical navigation on mobile' : 'Clinical navigation'} className={cn(mobile ? 'grid grid-cols-[0.8fr_1.4fr_1fr_1fr] gap-1 px-3 pb-2 sm:grid-cols-4 lg:hidden' : 'hidden items-center gap-1 lg:flex')}>
      {CLINICAL_LINKS.map(({ label, to, icon: Icon }) => {
        const active = to === '/doctor'
          ? pathname.replace(/\/$/, '') === to || pathname.startsWith('/doctor/consultation/') || pathname.startsWith('/doctor/prescribe/')
          : pathname === to || pathname.startsWith(`${to}/`)
        return (
          <Link key={to} to={to} aria-current={active ? 'page' : undefined}
            className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
              mobile ? 'min-w-0 px-1 text-xs sm:text-sm' : 'px-4 text-sm',
              active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}>
            <Icon className={cn('size-4 shrink-0', mobile && 'hidden sm:block')} strokeWidth={1.7} />{label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function DashboardNavbar() {
  const { logout, clinician, accounts } = useAuthStore()
  const name = clinician?.name || accounts.clinicianName || ''
  const displayName = name ? withDoctorPrefix(name) : 'Your account'
  const initials = name.replace(/^dr\.?\s*/i, '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('') || 'Dr'
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-lg print:hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavbarLogo />
        <ClinicalLinks />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Open your account menu" className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-full p-1.5 pr-3 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600 data-[state=open]:bg-slate-50">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold uppercase text-emerald-800">{initials}</span>
              <span className="hidden max-w-36 truncate text-sm font-medium sm:block">{withDoctorFirstName(name)}</span>
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl border-slate-200/80 p-2 shadow-lg shadow-slate-900/5">
            <DropdownMenuLabel className="px-3 py-3">
              <span className="block break-words text-sm text-slate-900">{displayName}</span>
              <SubscriptionStatusPill />
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-1" />
            <DropdownMenuItem asChild className="min-h-11 cursor-pointer rounded-xl px-3"><Link to="/doctor/account"><Settings2 />Practice &amp; account</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-11 cursor-pointer rounded-xl px-3"><Link to="/doctor/billing"><CreditCard />Membership</Link></DropdownMenuItem>
            <DropdownMenuSeparator className="mx-1" />
            <DropdownMenuItem onSelect={logout} className="min-h-11 cursor-pointer rounded-xl px-3 text-slate-500"><LogOut />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ClinicalLinks mobile />
    </header>
  )
}
