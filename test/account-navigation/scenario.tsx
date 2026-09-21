import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileForm } from '@/components/clinician/profile-form';
import DraftingPreference from '@/components/clinician/drafting-preference';
import AccountLayout from '@/components/dashboard/practice-account/account-layout';
import DashboardNavbar from '@/components/dashboard/navbar';
import { useAuthStore } from '@/stores/auth-store';
import { withDoctorFirstName } from '@/lib/clinician';
import { writes, setFailWrites } from './stubs/axios';

const profile = {
  user_id: 'doctor-test', name: 'Ahsan Habib', bmdc_no: 'A-12345', qualification: 'MBBS',
  specializations: ['Medicine'],
  header_config: { designation: '', accent_color: '#123456', logo_blob_name: 'existing-logo', contact_lines: [{ id: 'line-1', kind: 'phone', value: '01234567890' }] },
};
const settle = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); }); };
const button = (label: string) => {
  const element = [...document.querySelectorAll('button')].find(el => el.textContent === label);
  assert.ok(element, `Button exists: ${label}`);
  return element;
};
async function click(element: Element) {
  await act(async () => { element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); });
  await settle();
}
async function type(id: string, value: string) {
  const input = document.getElementById(id)!;
  const prototype = input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
}
export async function runTest() {
  assert.equal(withDoctorFirstName('Dr. Ahsan Habib'), 'Dr. Ahsan');
  assert.equal(withDoctorFirstName('Drake Chowdhury'), 'Dr. Drake');
  assert.equal(withDoctorFirstName('  Dr.Ahsan Habib  '), 'Dr. Ahsan');
  assert.equal(withDoctorFirstName('ডা. আসিফ আজাদ'), 'Dr. আসিফ');
  assert.equal(withDoctorFirstName(''), 'Your account');
  Object.assign(globalThis, { self: window, HTMLTextAreaElement: window.HTMLTextAreaElement });
  useAuthStore.setState({ userId: 'doctor-test', clinician: { name: profile.name, generate_ai_draft: true } as never });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const rootRoute = createRootRoute({ component: () => <><DashboardNavbar /><Outlet /></> });
  const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/doctor/profile', component: () => <AccountLayout section="profile" title="Profile" description="Professional details"><ProfileForm clinicianData={profile} /></AccountLayout> });
  const preferenceRoute = createRoute({ getParentRoute: () => rootRoute, path: '/doctor/account/preferences', component: () => <DraftingPreference enabled prescriptionsEnabled /> });
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/doctor', component: () => <p>Clinical home</p> });
  window.history.replaceState(null, '', '/doctor/profile');
  const router = createRouter({ routeTree: rootRoute.addChildren([profileRoute, preferenceRoute, homeRoute]), history: createBrowserHistory({ window }) });
  const root = createRoot(document.getElementById('root')!);
  await act(async () => { root.render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>); });
  await settle();
  assert.ok(document.querySelector('button[aria-label="Open your account menu"]')?.textContent?.includes('Dr. Ahsan'));
  assert.equal((document.getElementById('designation') as HTMLTextAreaElement).value, 'Medicine');
  console.log('PASS: legacy specialization appears when pad designation is empty');
  assert.ok(document.querySelector('a[href="/doctor/profile"][aria-current="page"]'));
  assert.equal(document.querySelectorAll('nav[aria-label="Clinical navigation"] a').length, 4);
  console.log('PASS: account section is selected and clinical destinations remain visible');
  await type('designation', 'Internal Medicine\nDiabetology');
  assert.equal(button('Save changes').disabled, false);
  await click(document.querySelector('a[href="/doctor/account/preferences"]')!);
  assert.ok(document.querySelector('[role="dialog"]'));
  assert.equal(router.state.location.pathname, '/doctor/profile');
  await click(button('Keep editing'));
  assert.equal((document.getElementById('designation') as HTMLTextAreaElement).value, 'Internal Medicine\nDiabetology');
  console.log('PASS: navigation blocks unsaved edits and Keep editing preserves the draft');
  await click(button('Save changes'));
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].payload.specializations, ['Internal Medicine\nDiabetology']);
  assert.deepEqual(writes[0].payload.header_config, { ...profile.header_config, designation: 'Internal Medicine\nDiabetology' });
  assert.ok(!('generate_ai_draft' in writes[0].payload));
  assert.equal(useAuthStore.getState().clinician?.generate_ai_draft, true);
  assert.equal(button('Save changes').disabled, true);
  console.log('PASS: profile save synchronizes identity, preserves pad design, and leaves drafting preference untouched');
  await type('profile-name', 'Changed name');
  setFailWrites(true);
  await click(button('Save changes'));
  setFailWrites(false);
  assert.equal(button('Save changes').disabled, false);
  assert.equal((document.getElementById('profile-name') as HTMLInputElement).value, 'Changed name');
  console.log('PASS: failed save retains the editable draft');
  await click(document.querySelector('a[href="/doctor/account/preferences"]')!);
  await click(button('Discard changes'));
  assert.equal(router.state.location.pathname, '/doctor/account/preferences');
  await click(document.querySelector('[role="switch"]')!);
  assert.deepEqual(writes[1].payload, { generate_ai_draft: false });
  assert.equal(useAuthStore.getState().clinician?.generate_ai_draft, false);
  console.log('PASS: discard navigates and drafting changes update the consultation auth state');
  await act(async () => { await router.navigate({ to: '/doctor' }); });
  await settle();
  assert.ok(document.querySelector('nav[aria-label="Clinical navigation"] a[href="/doctor"][aria-current="page"]'));
  console.log('PASS: clinical navigation highlights the current destination');
  await act(async () => root.unmount());
  client.clear();
  const { runPageChecks } = await import('./page-checks');
  await runPageChecks();
}
