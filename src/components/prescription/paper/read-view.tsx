import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";

import PrescriptionPaper from "./prescription-paper";
import { ResolvedPrescriptionHeader } from "../header/clinician-prescription-header";
import PrescriptionFooter from "../footer/prescription-footer";
import PatientStrip from "./patient-strip";
import SectionList from "./section-list";
import MedicineList from "./medicine-list";
import AdviceList from "./advice-list";
import VitalsBar from "./vitals-bar";
import FollowUpBlock from "./follow-up-block";
import { vitalsFromOnExaminations } from "@/lib/vitals";
import { resolveLetterhead, type HeaderConfigApi } from "@/lib/header-config";
import {
    mapChiefComplaintsToSectionItems,
    mapDiagnosesToSectionItems,
    mapHistoriesToSectionItems,
    mapInvestigationsToSectionItems,
    mapRxListToMedicineCards,
} from "./mappers";

export interface ClinicianProfile {
    name?:          string | null;
    qualification?: string | null;
    bmdc_no?:       string | null;
    header_config?: HeaderConfigApi | null;
}

interface PrescriptionReadViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
}

export default function PrescriptionReadView({ consultation, clinician, patient }: PrescriptionReadViewProps) {
    const data = consultation.prescription_data ?? {};
    const vitals = vitalsFromOnExaminations(data.on_examinations);
    const followUp = { follow_up_days: data.follow_up_days ?? null, follow_up_notes: data.follow_up_notes ?? null };

    const letterhead = resolveLetterhead(consultation, clinician);

    return (
        <PrescriptionPaper
            header={<ResolvedPrescriptionHeader letterhead={letterhead} responsive />}
            paperFooter={
                <PrescriptionFooter footer={letterhead.footer} config={letterhead.config} collapsible className="mt-2" />
            }
            patientStrip={
                <PatientStrip
                    name={consultation.patient_name}
                    dateOfBirth={patient?.date_of_birth}
                    sex={patient?.sex}
                    dateTime={consultation.created_at}
                />
            }
            vitalsBar={
                <VitalsBar
                    vitals={vitals}
                    sources={data.vital_sources}
                    currentSessionId={consultation.session_id}
                />
            }
            leftColumn={
                <>
                    <SectionList
                        title="Chief Complaints"
                        items={mapChiefComplaintsToSectionItems(data.chief_complaints)}
                    />
                    <SectionList
                        title="History"
                        items={mapHistoriesToSectionItems(data.histories)}
                    />
                    <SectionList
                        title="Diagnosis"
                        items={mapDiagnosesToSectionItems(data.diagnoses)}
                        isHighlighted
                    />
                    <SectionList
                        title="Investigation"
                        items={mapInvestigationsToSectionItems(data.investigations)}
                    />
                </>
            }
            rightColumn={
                <>
                    <MedicineList medicines={mapRxListToMedicineCards(data.rx_list)} />
                    <div className="mt-auto flex flex-col gap-3">
                        <AdviceList items={data.advice_list ?? []} />
                        <FollowUpBlock value={followUp} baseDate={consultation.created_at} />
                    </div>
                </>
            }
        />
    );
}
