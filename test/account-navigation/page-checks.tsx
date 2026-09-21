import assert from 'node:assert/strict';
import { act, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChambersManager from '@/components/dashboard/chambers/chambers-manager';
import ConsultationSettingsCard from '@/components/clinician/consultation-settings-card';
import MembershipPanel from '@/components/dashboard/subscription/membership-panel';
import QuestionRail from '@/components/dashboard/insights/question-rail';
import FilterBar from '@/components/dashboard/insights/filters/filter-bar';
import type { QuestionKey } from '@/components/dashboard/insights/questions';
import { EMPTY_INSIGHT_FILTERS, type InsightFilters } from '@/components/dashboard/insights/filters/insight-filters';
import { Route as MemoryRoute } from '@/routes/doctor/memory/index';
import { responses, writes } from './stubs/axios';

const flush = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 35)); }); };
async function mount(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rootRoute = createRootRoute({ component: Outlet });
  const page = createRoute({ getParentRoute: () => rootRoute, path: '/test', component: () => node });
  const router = createRouter({ routeTree: rootRoute.addChildren([page]), history: createMemoryHistory({ initialEntries: ['/test'] }) });
  const root = createRoot(document.getElementById('root')!);
  await act(async () => { root.render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>); });
  await flush();
  return async () => { await act(async () => root.unmount()); client.clear(); };
}
async function click(element: Element) {
  assert.ok(element);
  await act(async () => { element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); });
  await flush();
}
const button = (text: string) => [...document.querySelectorAll('button')].find(el => el.textContent?.includes(text))!;
function Explore() {
  const [question, setQuestion] = useState<QuestionKey>('complaints');
  const [filters, setFilters] = useState<InsightFilters>({ ...EMPTY_INSIGHT_FILTERS, sex: 'female' });
  return <><FilterBar filters={filters} onChange={setFilters} /><QuestionRail value={question} onChange={setQuestion} /></>;
}

export async function runPageChecks() {
  responses.set('/chamber', [{ chamber_id: 'one', hospital_name: 'A long hospital name — ঢাকা', room_no: '402' }]);
  responses.set('/chamber/one/attendant', [{ id: 'a', attendant_user_id: 'a', name: 'An attendant', phone: '01700000000', status: 'pending' }]);
  let unmount = await mount(<ChambersManager embedded />);
  const manage = button('Manage');
  assert.equal(manage.getAttribute('aria-expanded'), 'false');
  const panel = document.getElementById(manage.getAttribute('aria-controls')!)!;
  assert.ok(panel.hidden);
  await click(manage);
  assert.equal(panel.hidden, false);
  assert.ok(panel.textContent?.includes('An attendant'));
  assert.ok(panel.textContent?.includes('Pending'));
  assert.ok(document.querySelector('a[href*="section=chamber"]'));
  await click(manage);
  assert.ok(panel.hidden);
  console.log('PASS: chamber management expands accessibly without losing its chamber-specific pad link');
  await unmount();

  unmount = await mount(<ConsultationSettingsCard clinicianData={{ prescription_enabled: true, generate_ai_draft: true, prescription_sms_enabled: true }} />);
  let switches = [...document.querySelectorAll('[role="switch"]')];
  assert.equal(switches[0].getAttribute('aria-label'), 'Write prescriptions in Olive');
  assert.equal(switches[1].getAttribute('aria-labelledby'), 'drafting-label');
  assert.equal(switches[2].getAttribute('aria-label'), 'Text prescriptions to patients');
  const writeCount = writes.length;
  await click(switches[0]);
  assert.ok(document.querySelector('[role="dialog"]'));
  assert.equal(writes.length, writeCount);
  assert.ok((button('Turn it off') as HTMLButtonElement).disabled);
  await click(button('Keep it on'));
  console.log('PASS: preferences follow workflow order and retain the required disable confirmation');
  await unmount();

  unmount = await mount(<ConsultationSettingsCard clinicianData={{ prescription_enabled: false, generate_ai_draft: true, prescription_sms_enabled: true }} />);
  switches = [...document.querySelectorAll('[role="switch"]')];
  assert.equal((switches[0] as HTMLButtonElement).disabled, false);
  for (const dependent of switches.slice(1)) {
    assert.ok((dependent as HTMLButtonElement).disabled);
    assert.equal(dependent.getAttribute('aria-checked'), 'true');
  }
  console.log('PASS: turning prescription writing off retains dependent preferences without presenting them as usable');
  await unmount();

  unmount = await mount(<Explore />);
  const select = document.querySelector('select')!;
  assert.equal(select.options.length, 6);
  await act(async () => { select.value = 'returning'; select.dispatchEvent(new window.Event('change', { bubbles: true })); });
  assert.equal(button('Do they come back').getAttribute('aria-pressed'), 'true');
  await click(button('What I prescribe'));
  assert.equal(select.value, 'protocol');
  const toggle = button('Filter patients');
  await click(toggle);
  await click(toggle);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(button('Female'));
  console.log('PASS: mobile and desktop question selection stay synchronized; collapsing filters keeps applied filters visible');
  await unmount();

  responses.set('/subscription/doctor-test', { state: 'trial', consultations_remaining: 8, trial_limit: 10, price: 1000, prepay_months: [1, 3, 6, 12], bkash_number: '01700000000' });
  unmount = await mount(<MembershipPanel />);
  await click(button('3months'));
  assert.equal(button('3months').getAttribute('aria-pressed'), 'true');
  await click(button('Continue to payment'));
  assert.ok(document.body.textContent?.includes('3,000'));
  console.log('PASS: duration selection carries the correct total into payment instructions');
  await unmount();

  responses.set('/subscription/doctor-test', { state: 'trial', consultations_remaining: 8, trial_limit: 10, price: 1000, prepay_months: [1, 3, 6, 12], pending_payment: { amount: 3000, months: 3, created_at: '2026-09-01' } });
  unmount = await mount(<MembershipPanel />);
  assert.ok(document.body.textContent?.includes('Payment under review'));
  assert.equal(button('Continue to payment'), undefined);
  console.log('PASS: pending payment has one status view without a competing payment action');
  await unmount();

  responses.set('/prescription-template/my', [
    { template_id: 'pinned', template_name: 'Pinned prescription', is_pinned: true, sections: ['medicine'], use_count: 2, created_at: '2026-09-01' },
    { template_id: 'other', template_name: 'Other prescription', is_pinned: false, sections: ['advice'], use_count: 0, created_at: '2026-09-01' },
  ]);
  const MemoryPage = MemoryRoute.options.component!;
  unmount = await mount(<MemoryPage />);
  assert.ok(document.querySelector('section[aria-label="Pinned"]')?.textContent?.includes('Pinned prescription'));
  assert.ok(document.querySelector('section[aria-label="Other memories"]')?.textContent?.includes('Other prescription'));
  assert.ok(document.querySelector('a[href="/doctor/memory/manage/pinned"]'));
  await click(document.querySelector('button[aria-label="Pin memory"]')!);
  assert.deepEqual(writes.at(-1)?.payload, { is_pinned: true });
  console.log('PASS: memories have distinct pinned groups, keyboard-accessible links, and working pin actions');
  await unmount();
}
