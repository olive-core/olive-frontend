import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, ChevronRightIcon, HistoryIcon, PhoneIcon, Share2Icon, XIcon } from "lucide-react";
import type { ClinicianConsultationItem } from "@/types/consultation";
import { Button } from "@/components/ui/button";
import CaseCodeButton from "@/components/case/case-code-button";
import PatientAvatar from "./patient-avatar";
import SexAgeMeta from "./sex-age-meta";
import DiagnosisPills from "./diagnosis-pills";
import SearchHighlight from "./search-highlight";
import { formatPhone, matchedPhone, type SearchTokens } from "./filters/search-consultations";
import { getFullName, getTimeOfDay } from "./helpers";

interface ConsultationCardProps {
    consultation: ClinicianConsultationItem;
    onFollowUp: () => void;
    isStartingFollowUp?: boolean;
    onRemoveShared: () => void;
    isRemovingShared?: boolean;
    /** Active search words, so the row can show what the search landed on. */
    tokens?: SearchTokens;
}

export default function ConsultationCard({
    consultation,
    onFollowUp,
    isStartingFollowUp,
    onRemoveShared,
    isRemovingShared,
    tokens = [],
}: ConsultationCardProps) {
    const navigate = useNavigate();

    const handleOpen = () => {
        if (consultation.case_root_session_id) {
            navigate({ to: "/doctor/cases/$caseId", params: { caseId: consultation.case_root_session_id } });
            return;
        }
        navigate({
            to:     "/doctor/consultations/$prescriptionId",
            params: { prescriptionId: consultation.prescription_id },
            search: { document: undefined },
        });
    };

    const fullName = getFullName(consultation.patient_name);
    const timeOfDay = getTimeOfDay(consultation.created_at);
    // Numbers stay off the row until one is why the row is here: then it is both the
    // explanation for the match and the number the doctor was about to look up anyway.
    const phone = matchedPhone(consultation, tokens);

    const isShared = consultation.access_type === "shared";
    const canFollowUp = (consultation.can_follow_up ?? !isShared) && !!consultation.session_id && !consultation.has_follow_up;

    return (
        <div className="group w-full bg-white border border-slate-100 rounded-2xl px-4 py-4 transition-all duration-200 hover:shadow-md hover:border-emerald-200 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <button
                type="button"
                onClick={handleOpen}
                className="flex min-w-0 flex-1 cursor-pointer flex-col gap-3 text-left md:flex-row md:items-center md:gap-4"
            >
            <div className="flex items-center gap-4 md:contents">
                <PatientAvatar
                    name={consultation.patient_name}
                    sex={consultation.patient_sex}
                    className="w-11 h-11 text-sm"
                />

                <div className="flex-1 min-w-0 md:flex-none md:w-56 md:shrink-0">
                    <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition-colors">
                        <SearchHighlight text={fullName} tokens={tokens} />
                    </h3>
                    {consultation.consultation_count && (
                        <span className="mt-1 block text-xs text-slate-500">{consultation.consultation_count} {consultation.consultation_count === 1 ? "consultation" : "consultations"}</span>
                    )}
                    {isShared && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <Share2Icon className="size-3" />
                            Shared{consultation.shared_by_name ? ` by ${consultation.shared_by_name}` : " with you"}
                        </span>
                    )}
                    {consultation.clinician_name && (
                        <span className="mt-1 block text-xs text-slate-500">
                            Consultation by {consultation.clinician_name}
                        </span>
                    )}
                    <SexAgeMeta
                        sex={consultation.patient_sex}
                        dateOfBirth={consultation.patient_date_of_birth}
                    />
                    {phone && (
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <PhoneIcon aria-hidden className="size-3 shrink-0" />
                            <span className="font-mono truncate">
                                <SearchHighlight text={formatPhone(phone)} tokens={tokens} />
                            </span>
                        </span>
                    )}
                </div>

                <div className="md:hidden flex items-center gap-2 shrink-0 ml-auto">
                    <span className="text-xs text-slate-400 font-mono">{timeOfDay}</span>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <DiagnosisPills
                    diagnoses={consultation.diagnoses_summary}
                    complaints={consultation.chief_complaints_summary}
                    tokens={tokens}
                />
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
                <span className="text-xs text-slate-400 font-mono">{timeOfDay}</span>
                <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            </button>

            <div className="flex w-full flex-col gap-2 md:w-auto md:shrink-0">
            {consultation.case_code && <CaseCodeButton code={consultation.case_code} />}
            {canFollowUp ? (
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full shrink-0 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 md:w-auto"
                    onClick={onFollowUp}
                    isLoading={isStartingFollowUp}
                    disabled={isStartingFollowUp}
                >
                    <HistoryIcon className="size-4" />
                    Follow up
                </Button>
            ) : consultation.has_follow_up ? (
                <span className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-500 md:w-auto">
                    <CheckIcon className="size-3.5" /> Continued
                </span>
            ) : null}
            {isShared && (
                <Button
                    type="button"
                    variant="ghost"
                    className="h-11 w-full gap-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:w-auto"
                    onClick={onRemoveShared}
                    isLoading={isRemovingShared}
                    disabled={isRemovingShared}
                >
                    <XIcon className="size-4" /> Remove
                </Button>
            )}
            </div>
        </div>
    );
}
