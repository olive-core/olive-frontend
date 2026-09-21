import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCOUNT_GROUPS, type AccountSection } from './sections'

export function AccountSectionMenu({ active, mobile = false }: { active?: AccountSection; mobile?: boolean }) {
  return (
    <nav aria-label="Practice and account sections" className="space-y-7">
      {ACCOUNT_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{group.label}</p>
          <div className={cn('space-y-1', mobile && 'overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1')}>
            {group.sections.map(({ id, label, description, to, icon: Icon }) => (
              <Link key={id} to={to} aria-current={active === id ? 'page' : undefined}
                className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
                  active === id ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900')}>
                <Icon className="size-[18px] shrink-0" strokeWidth={1.7} />
                <span className="min-w-0 flex-1">
                  <span className="block">{label}</span>
                  {mobile && <span className="mt-1 block text-xs font-normal leading-relaxed text-slate-500">{description}</span>}
                </span>
                {mobile && <ChevronRight className="size-4 shrink-0 text-slate-400" />}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export default function AccountLayout({ section, title, description, children, index = false }: {
  section: AccountSection; title: string; description: string; children: ReactNode; index?: boolean
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <header className={cn('mb-8', !index && 'hidden lg:block')}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Practice &amp; account</h1>
        <p className="mt-2 text-sm text-slate-500">Make Olive feel at home in your practice.</p>
      </header>
      {index && <div className="lg:hidden"><AccountSectionMenu mobile /></div>}
      <div className={cn('lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12', index && 'hidden')}>
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--doctor-header-height)+1.5rem)]"><AccountSectionMenu active={section} /></div>
        </aside>
        <section className="min-w-0" aria-labelledby="account-section-title">
          {!index && <Link to="/doctor/account" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 lg:hidden"><ArrowLeft className="size-4" />Practice &amp; account</Link>}
          <header className="mb-6">
            <h2 id="account-section-title" className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">{description}</p>
          </header>
          {children}
        </section>
      </div>
    </div>
  )
}
