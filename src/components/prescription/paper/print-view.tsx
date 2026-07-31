import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";
import type { ClinicianProfile } from "./read-view";
import { resolveLetterhead } from "@/lib/header-config";
import { DEFAULT_PRINT_PAPER } from "@/lib/print-paper";
import PrescriptionPrintDocument from "./prescription-print-document";
import PatientStrip from "./patient-strip";

interface PrescriptionPrintViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
    /** Who is at the printer. Only the clinician has the chamber's pre-printed pad loaded. */
    audience:     "clinician" | "patient";
}

// A saved consultation's printable document: the snapshot letterhead (or the live
// clinician config for legacy rows) around the shared print body. A patient reprinting
// at home is on blank paper, so their copy always prints the full letterhead — never the
// pad geometry the prescription was issued with.
export default function PrescriptionPrintView({
    consultation,
    clinician,
    patient,
    audience,
}: PrescriptionPrintViewProps) {
    const letterhead = resolveLetterhead(consultation, clinician);

    return (
        <PrescriptionPrintDocument
            letterhead={letterhead}
            paper={audience === "clinician" ? letterhead.paper : DEFAULT_PRINT_PAPER}
            data={consultation.prescription_data ?? {}}
            patientSlot={
                <PatientStrip
                    name={consultation.patient_name}
                    dateOfBirth={patient?.date_of_birth}
                    sex={patient?.sex}
                    dateTime={consultation.created_at}
                />
            }
            followUpBaseDate={consultation.created_at}
        />
    );
}
