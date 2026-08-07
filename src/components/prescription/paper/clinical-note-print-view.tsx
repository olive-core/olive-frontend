import type { ConsultationDetail } from "@/types/consultation";
import type { NoteImageType } from "@/types/prescription";
import type { PatientInfoType } from "@/types/patient";
import type { ClinicianProfile } from "./read-view";
import { resolveLetterhead } from "@/lib/header-config";
import ClinicalNotePrintDocument from "./clinical-note-print-document";
import PatientStrip from "./patient-strip";

interface ClinicalNotePrintViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
    /** The note as currently shown on screen, including unsaved edits. */
    notes:        string | null;
    /** Photos with live signed URLs, as shown on screen. */
    images?:      NoteImageType[];
}

// A saved consultation's printable clinical note: the snapshot letterhead (or the live
// clinician config for legacy rows) around the shared note print document.
export default function ClinicalNotePrintView({ consultation, clinician, patient, notes, images }: ClinicalNotePrintViewProps) {
    return (
        <ClinicalNotePrintDocument
            letterhead={resolveLetterhead(consultation, clinician)}
            notes={notes}
            safetyNet={consultation.prescription_data?.safety_net ?? []}
            images={images}
            patientSlot={
                <PatientStrip
                    name={consultation.patient_name}
                    dateOfBirth={patient?.date_of_birth}
                    sex={patient?.sex}
                    dateTime={consultation.created_at}
                />
            }
        />
    );
}
