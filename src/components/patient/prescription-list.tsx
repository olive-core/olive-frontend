import type { PatientPrescriptionListItem } from "@/types/patient";
import PrescriptionCard from "./prescription-card";

interface PrescriptionListProps {
    prescriptions: PatientPrescriptionListItem[];
}

export default function PrescriptionList({ prescriptions }: PrescriptionListProps) {
    return (
        <ul className="flex flex-col gap-3">
            {prescriptions.map((prescription) => (
                <li key={prescription.prescription_id}>
                    <PrescriptionCard prescription={prescription} />
                </li>
            ))}
        </ul>
    );
}
