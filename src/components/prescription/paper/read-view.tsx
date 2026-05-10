import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";

import PrescriptionPaper from "./prescription-paper";
import ClinicianHeader from "./clinician-header";
import PatientStrip from "./patient-strip";
import SummaryBlock from "./summary-block";
import SectionList from "./section-list";
import MedicineList from "./medicine-list";
import AdviceList from "./advice-list";
import {
    mapChiefComplaintsToSectionItems,
    mapDiagnosesToSectionItems,
    mapHistoriesToSectionItems,
    mapInvestigationsToSectionItems,
    mapRxListToMedicineCards,
} from "./mappers";

export interface ClinicianProfile {
    first_name?:    string | null;
    last_name?:     string | null;
    qualification?: string | null;
    bmdc_no?:       string | null;
}

interface PrescriptionReadViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
}

export default function PrescriptionReadView({ consultation, clinician, patient }: PrescriptionReadViewProps) {
    const data = consultation.prescription_data ?? {};

    return (
        <PrescriptionPaper
            header={
                <ClinicianHeader
                    firstName={clinician?.first_name ?? consultation.clinician_first_name}
                    lastName={clinician?.last_name ?? consultation.clinician_last_name}
                    qualification={clinician?.qualification}
                    bmdcNo={clinician?.bmdc_no}
                />
            }
            patientStrip={
                <PatientStrip
                    firstName={consultation.patient_first_name}
                    lastName={consultation.patient_last_name}
                    dateOfBirth={patient?.date_of_birth}
                    sex={patient?.sex}
                    dateTime={consultation.created_at}
                />
            }
            leftColumn={
                <>
                    <SummaryBlock summary={data.summary} />
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
                    <div className="mt-auto">
                        <AdviceList items={data.advice_list ?? []} />
                    </div>
                </>
            }
        />
    );
}
