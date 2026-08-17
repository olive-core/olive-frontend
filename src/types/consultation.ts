import type { ChiefComplaintItem, DiagnosisItem, RxItem } from "./patient";
import type { HeaderConfigApi, RenderConfigApi } from "@/lib/header-config";
import type { ClinicalNoteType, NoteImageType, VitalSourceType, VitalsType } from "./prescription";

export type PatientSex = 'male' | 'female' | 'non_binary';

export type ClinicianConsultationItem = {
    prescription_id:        string;
    session_id?:            string;
    created_at:             string;
    diagnoses_summary:      string[];
    chief_complaints_summary?: string[];
    follow_up_of_session_id?: string | null;
    previous_prescription_id?: string | null;
    next_prescription_id?: string | null;
    has_follow_up?:         boolean;
    patient_id:             string;
    patient_name?:          string | null;
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
    clinical_note?:    ClinicalNoteType | null;
    vital_sources?:    Record<string, VitalSourceType>;
    safety_net?:       string[];
    note_images?:      NoteImageType[];
}

export type ConsultationDetail = {
    prescription_id:       string;
    session_id?:           string;
    clinician_id:          string;
    clinician_name?:        string | null;
    patient_id:            string;
    patient_name?:          string | null;
    prescription_data?:    ConsultationPrescriptionData | null;
    /** False for note-only consultations; frozen at save time, never recomputed. */
    includes_prescription?: boolean;
    created_at:            string;
    updated_at:            string;
    follow_up_of_session_id?: string | null;
    previous_prescription_id?: string | null;
    next_prescription_id?: string | null;
    has_follow_up?:         boolean;
    // Letterhead: render_config is the snapshot frozen at save time; the
    // clinician_* fields back-fill legacy prescriptions saved before snapshots.
    chamber_id?:              string | null;
    render_config?:           RenderConfigApi | null;
    qualification?:           string | null;
    bmdc_no?:                 string | null;
    clinician_header_config?: HeaderConfigApi | null;
}
