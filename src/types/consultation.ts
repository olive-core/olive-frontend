import type { ChiefComplaintItem, DiagnosisItem, RxItem } from "./patient";
import type { VitalsType } from "./prescription";

export type PatientSex = 'male' | 'female' | 'non_binary';

export type ClinicianConsultationItem = {
    prescription_id:        string;
    session_id?:            string;
    created_at:             string;
    diagnoses_summary:      string[];
    patient_id:             string;
    patient_first_name?:    string | null;
    patient_last_name?:     string | null;
    patient_sex?:           PatientSex | null;
    patient_date_of_birth?: string | null;
}

export type ConsultationHistoryItem = {
    hn_id:     string | null;
    name_text: string;
    duration?: string;
    notes?:    string;
}

export type ConsultationInvestigationItem = {
    investigation_name_id: string | null;
    name_text:             string;
    reason?:               string;
    priority?:             string;
}

export type ConsultationPrescriptionData = {
    chief_complaints?: ChiefComplaintItem[];
    histories?:        ConsultationHistoryItem[];
    diagnoses?:        DiagnosisItem[];
    investigations?:   ConsultationInvestigationItem[];
    rx_list?:          RxItem[];
    advice_list?:      string[];
    on_examinations?:  VitalsType[];
    follow_up_days?:   number | null;
    follow_up_notes?:  string | null;
    summary?:          string | null;
}

export type ConsultationDetail = {
    prescription_id:       string;
    session_id?:           string;
    clinician_id:          string;
    clinician_first_name?: string | null;
    clinician_last_name?:  string | null;
    patient_id:            string;
    patient_first_name?:   string | null;
    patient_last_name?:    string | null;
    prescription_data?:    ConsultationPrescriptionData | null;
    created_at:            string;
    updated_at:            string;
}
