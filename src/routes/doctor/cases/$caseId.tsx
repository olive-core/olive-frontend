import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeftIcon, ChevronRightIcon, HistoryIcon, KeyRoundIcon, Share2Icon } from 'lucide-react';
import { useState } from 'react';
import { useCase } from '@/hooks/use-case';
import { useStartConsultation } from '@/hooks/use-start-consultation';
import { Button } from '@/components/ui/button';
import CaseCodeButton from '@/components/case/case-code-button';
import OpenCaseDialog from '@/components/case/open-case-dialog';
import CaseShareDialog from '@/components/consultation/case-share-button';
import ConsultationDetailContent from '@/components/consultation/consultation-detail';
import SexAgeMeta from '@/components/dashboard/consultations/sex-age-meta';
import DiagnosisPills from '@/components/dashboard/consultations/diagnosis-pills';

export const Route = createFileRoute('/doctor/cases/$caseId')({ component: CasePage });

function CasePage() {
    const { caseId } = Route.useParams();
    const { data: patientCase, isLoading, isError, refetch } = useCase(caseId);
    const [shareOpen, setShareOpen] = useState(false);
    const [codeEntryOpen, setCodeEntryOpen] = useState(false);
    const navigate = useNavigate();
    const { start, startingSourceSessionId, graceDialog } = useStartConsultation();

    return (
        <div className="pb-10">
            <div className="container mx-auto max-w-4xl px-4 pt-6 print:hidden">
                <Link to="/doctor/consultations" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                    <ArrowLeftIcon className="size-4" /> Consultations
                </Link>
                {isLoading && <div role="status" className="h-36 animate-pulse rounded-2xl bg-slate-100"><span className="sr-only">Loading case</span></div>}
                {isError && <div className="rounded-2xl border border-slate-200 p-6 text-center">
                    <p className="text-slate-700">Could not open this case. You may need its code to access it.</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-4 min-h-11">Try again</Button>
                </div>}
                {patientCase && (
                    <>
                        <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div className="min-w-0">
                                    <h1 className="break-words text-xl font-semibold text-slate-900">{patientCase.patient_name || 'Patient'}</h1>
                                    <SexAgeMeta sex={patientCase.patient_sex} dateOfBirth={patientCase.patient_date_of_birth} />
                                    <p className="mt-2 text-xs text-slate-500">{patientCase.consultation_count} {patientCase.consultation_count === 1 ? 'consultation' : 'consultations'}</p>
                                </div>
                                {patientCase.case_code && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CaseCodeButton code={patientCase.case_code} />
                                        <Button variant="outline" className="min-h-11" onClick={() => setShareOpen(true)}><Share2Icon className="size-4" /> Share</Button>
                                    </div>
                                )}
                            </div>
                            {patientCase.pending_follow_up ? (
                                <div role="status" className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                    <p>{patientCase.pending_follow_up.is_yours ? 'You have' : `${patientCase.pending_follow_up.clinician_name || 'Another doctor'} has`} a follow-up in progress. Saved consultations remain available below.</p>
                                    {patientCase.pending_follow_up.is_yours && (
                                        <Button variant="outline" className="min-h-11 shrink-0"
                                            onClick={() => navigate({ to: '/doctor/consultation/$userId/$consultationId', params: { userId: patientCase.patient_id, consultationId: patientCase.pending_follow_up!.session_id } })}>
                                            Continue follow-up
                                        </Button>
                                    )}
                                </div>
                            ) : patientCase.access_type === 'clinician' ? (
                                <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                    <p>You can read this case. To add a follow-up, enter the case code from the medical sheet.</p>
                                    <Button variant="outline" className="min-h-11 shrink-0" onClick={() => setCodeEntryOpen(true)}>
                                        <KeyRoundIcon className="size-4" /> Enter case code
                                    </Button>
                                </div>
                            ) : patientCase.can_follow_up && patientCase.session_id && (
                                <Button className="mt-4 min-h-11 w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                                    isLoading={!!startingSourceSessionId} disabled={!!startingSourceSessionId}
                                    onClick={() => start(patientCase.patient_id, undefined, patientCase.session_id)}>
                                    <HistoryIcon className="size-4" /> Add follow-up
                                </Button>
                            )}
                        </header>
                        {patientCase.consultations.length > 1 && (
                            <section className="mt-6 space-y-3" aria-label="Consultations in this case">
                                <p className="text-xs font-medium text-slate-500">Latest consultation first</p>
                                {patientCase.consultations.map((consultation, index) => (
                                    <Link key={consultation.prescription_id} to="/doctor/consultations/$prescriptionId"
                                        params={{ prescriptionId: consultation.prescription_id }} search={{ document: undefined }}
                                        className="group flex min-h-24 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30 focus-visible:outline-2 focus-visible:outline-emerald-600">
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-800">
                                                <time dateTime={consultation.created_at}>{new Date(consultation.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                                                {index === 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Latest</span>}
                                            </div>
                                            <p className="break-words text-sm text-slate-500">{consultation.clinician_name || 'Doctor'}</p>
                                            <DiagnosisPills diagnoses={consultation.diagnoses_summary} complaints={consultation.chief_complaints_summary} />
                                        </div>
                                        <ChevronRightIcon className="size-4 shrink-0 text-slate-400 group-hover:text-emerald-600" />
                                    </Link>
                                ))}
                            </section>
                        )}
                    </>
                )}
            </div>
            {patientCase?.consultations.length === 1 && <ConsultationDetailContent key={patientCase.prescription_id} prescriptionId={patientCase.prescription_id} embedded />}
            {patientCase?.case_code && <CaseShareDialog prescriptionId={patientCase.prescription_id} open={shareOpen} onOpenChange={setShareOpen} />}
            <OpenCaseDialog open={codeEntryOpen} onOpenChange={setCodeEntryOpen} />
            {graceDialog}
        </div>
    );
}
