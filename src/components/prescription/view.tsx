import { useParams } from "@tanstack/react-router";

import PatientInfo from "./patient-info";
import PrescriptionPrintDocument from "./paper/prescription-print-document";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { useComposeLetterhead } from "@/hooks/use-compose-letterhead";

// The in-session draft's printable document, fed by the live editor store and the same
// letterhead resolution the backend freezes into render_config at save time — so what
// prints here is exactly what the saved consultation will print later.
export const PrescriptionView = () => {
    const { consultationId } = useParams({ from: "/doctor/prescribe/$consultationId" });
    const getSubmitPayload = usePrescriptionStore((s) => s.getSubmitPayload);
    const { letterhead } = useComposeLetterhead(consultationId);

    return (
        <PrescriptionPrintDocument
            letterhead={letterhead}
            paper={letterhead?.paper}
            data={getSubmitPayload(consultationId)}
            patientSlot={<PatientInfo sessionId={consultationId} />}
        />
    );
};
