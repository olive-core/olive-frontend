import type { PatientPrescriptionListItem } from "@/types/patient";
import PrescriptionCard from "./prescription-card";

interface PrescriptionListProps {
    prescriptions: PatientPrescriptionListItem[];
}

export default function PrescriptionList({ prescriptions }: PrescriptionListProps) {
    return (
        <div className="flex flex-col gap-3">
            {prescriptions.map((prescription) => (
                <PrescriptionCard
                    key={prescription.prescription_id}
                    prescription={prescription}
                />
            ))}
        </div>
    );
}
