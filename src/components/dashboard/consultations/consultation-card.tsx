import { useNavigate } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import type { ClinicianConsultationItem } from "@/types/consultation";
import PatientAvatar from "./patient-avatar";
import SexAgeMeta from "./sex-age-meta";
import DiagnosisPills from "./diagnosis-pills";
import { getFullName, getTimeOfDay } from "./helpers";

interface ConsultationCardProps {
    consultation: ClinicianConsultationItem;
}

export default function ConsultationCard({ consultation }: ConsultationCardProps) {
    const navigate = useNavigate();

    const handleOpen = () => {
        navigate({
            to:     "/dashboard/consultations/$prescriptionId",
            params: { prescriptionId: consultation.prescription_id },
        });
    };

    const fullName = getFullName(consultation.patient_first_name, consultation.patient_last_name);
    const timeOfDay = getTimeOfDay(consultation.created_at);

    return (
        <button
            onClick={handleOpen}
            className="group w-full text-left bg-white border border-slate-100 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-200 flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
        >
            <div className="flex items-center gap-4 md:contents">
                <PatientAvatar
                    firstName={consultation.patient_first_name}
                    lastName={consultation.patient_last_name}
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
    );
}
