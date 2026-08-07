import { useParams } from "@tanstack/react-router";

import PatientInfo from "./patient-info";
import ClinicalNotePrintDocument from "./paper/clinical-note-print-document";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { useComposeLetterhead } from "@/hooks/use-compose-letterhead";

// The in-session draft's printable clinical note, fed by the live editor store and the
// same letterhead resolution the prescription print uses.
export const ClinicalNoteView = () => {
    const { consultationId } = useParams({ from: "/doctor/prescribe/$consultationId" });
    const summary = usePrescriptionStore((s) => s.summary);
    const safetyNet = usePrescriptionStore((s) => s.safetyNet);
    const noteImages = usePrescriptionStore((s) => s.noteImages);
    const { letterhead } = useComposeLetterhead(consultationId);

    return (
        <ClinicalNotePrintDocument
            letterhead={letterhead}
            notes={summary}
            safetyNet={safetyNet}
            images={noteImages}
            patientSlot={<PatientInfo sessionId={consultationId} />}
        />
    );
};
