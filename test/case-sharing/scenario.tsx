import assert from 'node:assert/strict';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route } from '@/routes/doctor/cases/$caseId';
import OpenCaseDialog from '@/components/case/open-case-dialog';
import ConsultationCard from '@/components/dashboard/consultations/consultation-card';
import { filterConsultationsByAccess } from '@/components/dashboard/consultations/filters/filter-by-access';
import { calls, responses, setFailOpen } from './stubs/axios';
import { navigations } from './stubs/router';
import { starts } from './stubs/start';
import type { CaseDetail } from '@/types/case';

const first = { prescription_id:'rx-root',session_id:'root',clinician_id:'owner',clinician_name:'Dr. Amina',created_at:'2026-09-25T10:00:00Z',diagnoses_summary:['Fever'],chief_complaints_summary:[],has_follow_up:false };
const base: CaseDetail = { ...first,case_root_session_id:'root',case_code:'7KMP4XRT',consultation_count:1,is_only_me:true,patient_id:'patient',patient_name:'Example Patient',access_type:'owned',can_follow_up:true,consultations:[first] };
const wait = () => new Promise(resolve => setTimeout(resolve,40));
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
async function mount(view: React.ReactNode) {
    host = document.createElement('div'); document.body.appendChild(host); root=createRoot(host);
    const client = new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
    await act(async () => { root.render(<QueryClientProvider client={client}>{view}</QueryClientProvider>); await wait(); });
    await act(wait);
}
async function unmount() { await act(async () => root.unmount()); host.remove(); }
async function click(button: Element | null) { assert.ok(button); await act(async () => { button.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true})); await wait(); }); }
function buttonWith(text: string) { return [...document.querySelectorAll('button')].find(button => button.textContent?.includes(text)) ?? null; }
function pass(message:string) { console.log('PASS:',message); }

export async function run() {
    const copied: string[]=[];
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async (value:string) => { copied.push(value); }}});
    responses.set('/case/detail/root',base);
    const Page = Route.component;
    await mount(<Page />);
    assert.match(host.textContent ?? '',/Example Patient/);
    assert.ok(host.querySelector('[data-testid="consultation-viewer"]'));
    assert.equal(host.querySelectorAll('section[aria-label="Consultations in this case"]').length,0);
    await click(host.querySelector('[aria-label="Copy case code 7KMP-4XRT"]'));
    assert.equal(copied.at(-1),'7KMP-4XRT');
    await click(buttonWith('Add follow-up'));
    assert.deepEqual(starts.at(-1),['patient',undefined,'root']);
    pass('single-consultation case opens the viewer, copies its code and starts from the correct visit');
    await unmount();

    responses.set('/case/detail/root',{...base,consultation_count:2,is_only_me:false,session_id:'followup',prescription_id:'rx-followup',consultations:[{...first,session_id:'followup',prescription_id:'rx-followup',clinician_name:'Dr. Karim'},first]});
    await mount(<Page />);
    assert.equal(host.querySelectorAll('[data-testid="consultation-viewer"]').length,0);
    const links=host.querySelectorAll('section a'); assert.equal(links.length,2);
    assert.match(links[0].textContent ?? '',/Dr. Karim/);
    await click(links[0]);
    assert.deepEqual(navigations.at(-1),{to:'/doctor/consultations/$prescriptionId',params:{prescriptionId:'rx-followup'}});
    pass('multiple consultations open as ordered cards linked to their individual records');
    await unmount();

    responses.set('/case/detail/root',{...base,can_follow_up:false,pending_follow_up:{clinician_name:'Dr. Karim',is_yours:false}});
    await mount(<Page />);
    assert.match(host.textContent ?? '',/Dr. Karim has a follow-up in progress/);
    assert.equal(buttonWith('Add follow-up'),null);
    pass('unfinished follow-up is visible and cannot be branched');
    await unmount();

    responses.set('/case/detail/root',{...base,can_follow_up:false,pending_follow_up:{session_id:'draft',clinician_name:'Dr. Amina',is_yours:true}});
    await mount(<Page />);
    await click(buttonWith('Continue follow-up'));
    assert.deepEqual(navigations.at(-1),{to:'/doctor/consultation/$userId/$consultationId',params:{userId:'patient',consultationId:'draft'}});
    pass('your own unfinished follow-up can be resumed from the case');
    await unmount();

    responses.set('/case/detail/root',{...base,access_type:'clinician',case_code:null,can_follow_up:false,can_share_case:false});
    await mount(<Page />);
    assert.match(host.textContent ?? '',/Example Patient/);
    assert.ok(host.querySelector('[data-testid="consultation-viewer"]'));
    assert.equal(host.querySelector('[aria-label^="Copy case code"]'),null);
    assert.equal(buttonWith('Share'),null);
    assert.equal(buttonWith('Add follow-up'),null);
    assert.ok(buttonWith('Enter case code'));
    pass('a doctor without the code reads the case but cannot see the code or add follow-ups');
    await unmount();

    await mount(<ConsultationCard consultation={base} onFollowUp={()=>{}} onRemoveShared={()=>{}} />);
    const before=navigations.length;
    await click(host.querySelector('[aria-label="Copy case code 7KMP-4XRT"]'));
    assert.equal(navigations.length,before);
    pass('copying the code on a case card does not open the card');
    await unmount();

    await mount(<OpenCaseDialog open onOpenChange={()=>{}} />);
    const input=document.querySelector('input#case-code') as HTMLInputElement;
    await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value')!.set!.call(input,'7kmp-4xrt'); input.dispatchEvent(new window.Event('input',{bubbles:true})); });
    setFailOpen(true);
    await click(buttonWith('Open case'));
    assert.match(document.querySelector('[role="alert"]')?.textContent ?? '',/Case code not found/);
    setFailOpen(false);
    await click(buttonWith('Open case'));
    assert.deepEqual(calls.filter(call=>call.url==='/case/open').at(-1)?.body,{code:'7kmp-4xrt'});
    assert.deepEqual(navigations.at(-1),{to:'/doctor/cases/$caseId',params:{caseId:'root'}});
    pass('code entry handles errors and opens the stable case URL on success');
    await unmount();

    const items=[base,{...base,prescription_id:'shared',is_only_me:false,access_type:'owned' as const}];
    assert.deepEqual(filterConsultationsByAccess(items,'owned').map(item=>item.prescription_id),['rx-root']);
    assert.deepEqual(filterConsultationsByAccess(items,'shared').map(item=>item.prescription_id),['shared']);
    pass('filters reflect contributors rather than case ownership');
}
