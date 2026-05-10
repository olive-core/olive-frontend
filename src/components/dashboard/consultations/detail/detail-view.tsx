import { Card, CardContent } from "@/components/ui/card";
import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";
import DetailHeader from "./header";
import ChiefComplaintsSection from "./chief-complaints-section";
import HistorySection from "./history-section";
import DiagnosesSection from "./diagnoses-section";
import InvestigationsSection from "./investigations-section";
import MedicinesSection from "./medicines-section";
import AdviceSection from "./advice-section";
import FollowUpSection from "./follow-up-section";

interface DetailViewProps {
    consultation: ConsultationDetail;
    patient?:     PatientInfoType;
}

function hasAnySectionContent(consultation: ConsultationDetail): boolean {
    const data = consultation.prescription_data;
    if (!data) return false;
    return Boolean(
        data.chief_complaints?.length ||
        data.histories?.length ||
        data.diagnoses?.length ||
        data.investigations?.length ||
        data.rx_list?.length ||
        data.advice_list?.length ||
        (data.follow_up_days !== null && data.follow_up_days !== undefined) ||
        (data.follow_up_notes && data.follow_up_notes.trim().length > 0),
    );
}

export default function DetailView({ consultation, patient }: DetailViewProps) {
    const data = consultation.prescription_data ?? {};
    const sectionsArePresent = hasAnySectionContent(consultation);

    return (
        <div className="space-y-6">
            <DetailHeader consultation={consultation} patient={patient} />

            <Card className="rounded-2xl shadow-sm">
                <CardContent className="space-y-5 pt-6">
                    {!sectionsArePresent && (
                        <p className="text-sm text-slate-400 text-center py-6">
                            No prescription details were recorded for this consultation.
                        </p>
                    )}

                    <ChiefComplaintsSection chiefComplaints={data.chief_complaints ?? []} />
                    <HistorySection         histories={data.histories ?? []} />
                    <DiagnosesSection       diagnoses={data.diagnoses ?? []} />
                    <InvestigationsSection  investigations={data.investigations ?? []} />
                    <MedicinesSection       medicines={data.rx_list ?? []} />
                    <AdviceSection          advice={data.advice_list ?? []} />
                    <FollowUpSection        days={data.follow_up_days} notes={data.follow_up_notes} />
                </CardContent>
            </Card>
        </div>
    );
}
