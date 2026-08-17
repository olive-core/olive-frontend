import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import type { ClinicianConsultationItem } from "@/types/consultation";
import { Button } from "@/components/ui/button";
import ConsultationLinkMark from "@/components/consultation-start/consultation-link-mark";
import PatientAvatar from "./patient-avatar";
import SexAgeMeta from "./sex-age-meta";
import DiagnosisPills from "./diagnosis-pills";
import { getFullName, getTimeOfDay } from "./helpers";

interface ConsultationCardProps {
    consultation: ClinicianConsultationItem;
    onFollowUp: () => void;
    isStartingFollowUp?: boolean;
}

export default function ConsultationCard({ consultation, onFollowUp, isStartingFollowUp }: ConsultationCardProps) {
    const navigate = useNavigate();

    const handleOpen = () => {
        navigate({
            to:     "/doctor/consultations/$prescriptionId",
            params: { prescriptionId: consultation.prescription_id },
            search: { document: undefined },
        });
    };

    const fullName = getFullName(consultation.patient_name);
    const timeOfDay = getTimeOfDay(consultation.created_at);

    const canFollowUp = !!consultation.session_id && !consultation.has_follow_up;

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
                        {fullName}
                    </h3>
                    <SexAgeMeta
                        sex={consultation.patient_sex}
                        dateOfBirth={consultation.patient_date_of_birth}
                    />
                </div>

                <div className="md:hidden flex items-center gap-2 shrink-0 ml-auto">
                    <span className="text-xs text-slate-400 font-mono">{timeOfDay}</span>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <DiagnosisPills diagnoses={consultation.diagnoses_summary} />
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
                <span className="text-xs text-slate-400 font-mono">{timeOfDay}</span>
                <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            </button>

            {canFollowUp ? (
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    onClick={onFollowUp}
                    isLoading={isStartingFollowUp}
                    disabled={isStartingFollowUp}
                >
                    <ConsultationLinkMark />
                    Follow up
                </Button>
            ) : consultation.has_follow_up ? (
                <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-500">
                    <CheckIcon className="size-3.5" /> Continued
                </span>
            ) : null}
        </div>
    );
}
