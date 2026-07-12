import { useNavigate } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import type { PatientPrescriptionListItem } from "@/types/patient";
import DiagnosisPills from "@/components/dashboard/consultations/diagnosis-pills";
import { getDayLabel, getTimeOfDay } from "@/components/dashboard/consultations/helpers";

interface PrescriptionCardProps {
    prescription: PatientPrescriptionListItem;
}

function getClinicianName(name?: string | null): string {
    const n = (name ?? "").trim();
    return n ? `Dr. ${n}` : "Unknown clinician";
}

export default function PrescriptionCard({ prescription }: PrescriptionCardProps) {
    const navigate = useNavigate();

    const handleOpen = () => {
        navigate({
            to:     "/patient/prescriptions/$prescriptionId",
            params: { prescriptionId: prescription.prescription_id },
        });
    };

    const clinicianName = getClinicianName(prescription.clinician_name);

    return (
        <button
            onClick={handleOpen}
            className="group w-full text-left bg-white border border-slate-100 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-200 flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
        >
            <div className="flex-1 min-w-0 md:flex-none md:w-56 md:shrink-0">
                <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition-colors">
                    {clinicianName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    {getDayLabel(prescription.created_at)}
                </p>
            </div>

            <div className="flex-1 min-w-0">
                <DiagnosisPills diagnoses={prescription.diagnoses_summary} />
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
                <span className="text-xs text-slate-500 font-mono">
                    {getTimeOfDay(prescription.created_at)}
                </span>
                <ChevronRightIcon aria-hidden className="size-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
        </button>
    );
}
