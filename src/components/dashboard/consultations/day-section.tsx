import type { ClinicianConsultationItem } from "@/types/consultation";
import ConsultationCard from "./consultation-card";
import { getDayLabel } from "./helpers";

interface DaySectionProps {
    isoDate:       string;
    consultations: ClinicianConsultationItem[];
    onFollowUp: (consultation: ClinicianConsultationItem) => void;
    startingSourceSessionId?: string | null;
    onRemoveShared: (consultation: ClinicianConsultationItem) => void;
    removingRootSessionId?: string;
}

export default function DaySection({
    isoDate,
    consultations,
    onFollowUp,
    startingSourceSessionId,
    onRemoveShared,
    removingRootSessionId,
}: DaySectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-baseline gap-3">
                <h2 className="text-sm font-semibold text-slate-700">
                    {getDayLabel(isoDate)}
                </h2>
                <span className="text-xs text-slate-400">
                    {consultations.length}
                    {consultations.length === 1 ? " record" : " records"}
                </span>
            </div>

            <div className="flex flex-col gap-3">
                {consultations.map((consultation) => (
                    <ConsultationCard
                        key={consultation.prescription_id}
                        consultation={consultation}
                        onFollowUp={() => onFollowUp(consultation)}
                        isStartingFollowUp={startingSourceSessionId === consultation.session_id}
                        onRemoveShared={() => onRemoveShared(consultation)}
                        isRemovingShared={removingRootSessionId === consultation.case_root_session_id}
                    />
                ))}
            </div>
        </section>
    );
}
