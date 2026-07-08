import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";
import type { ClinicianProfile } from "./read-view";
import { resolveLetterhead } from "@/lib/header-config";
import PrescriptionPrintDocument from "./prescription-print-document";
import PatientStrip from "./patient-strip";

interface PrescriptionPrintViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
}

// A saved consultation's printable document: the snapshot letterhead (or the live
// clinician config for legacy rows) around the shared print body.
export default function PrescriptionPrintView({ consultation, clinician, patient }: PrescriptionPrintViewProps) {
    return (
        <PrescriptionPrintDocument
            letterhead={resolveLetterhead(consultation, clinician)}
            data={consultation.prescription_data ?? {}}
            patientSlot={
                <PatientStrip
                    firstName={consultation.patient_first_name}
                    lastName={consultation.patient_last_name}
                    dateOfBirth={patient?.date_of_birth}
                    sex={patient?.sex}
                    dateTime={consultation.created_at}
                />
            }
            followUpBaseDate={consultation.created_at}
        />
    );
}
