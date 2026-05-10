import { ArrowLeftIcon, CalendarDaysIcon, PrinterIcon, StethoscopeIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import PatientAvatar from "../patient-avatar";
import SexAgeMeta from "../sex-age-meta";
import { getFullName } from "../helpers";
import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";

interface DetailHeaderProps {
    consultation: ConsultationDetail;
    patient?:     PatientInfoType;
}

function formatConsultationDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    return `${format(date, "MMM d, yyyy")} · ${format(date, "h:mm a")}`;
}

export default function DetailHeader({ consultation, patient }: DetailHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate({ to: "/dashboard/consultations" });
    };

    const patientFullName = getFullName(consultation.patient_first_name, consultation.patient_last_name);
    const clinicianFullName = getFullName(consultation.clinician_first_name, consultation.clinician_last_name);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-slate-500 hover:text-slate-800 -ml-2"
                >
                    <ArrowLeftIcon className="size-4 mr-1" />
                    Back to consultations
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="gap-2"
                >
                    <PrinterIcon className="size-4" />
                    Print
                </Button>
            </div>

            <div className="flex items-start gap-4">
                <PatientAvatar
                    firstName={consultation.patient_first_name}
                    lastName={consultation.patient_last_name}
                    sex={patient?.sex}
                    className="w-16 h-16 text-lg"
                />

                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-slate-900">
                        {patientFullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                        <SexAgeMeta sex={patient?.sex} dateOfBirth={patient?.date_of_birth} />
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDaysIcon className="size-3.5" />
                            {formatConsultationDateTime(consultation.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <StethoscopeIcon className="size-3.5" />
                            Dr. {clinicianFullName}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
