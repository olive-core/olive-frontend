import type { ClinicianConsultationItem } from './consultation';

export type CaseConsultation = {
    prescription_id: string;
    session_id: string;
    clinician_id: string;
    clinician_name?: string | null;
    created_at: string;
    diagnoses_summary: string[];
    chief_complaints_summary: string[];
    has_follow_up: boolean;
};

export type CaseDetail = Omit<ClinicianConsultationItem, 'access_type'> & {
    case_root_session_id: string;
    // Withheld from doctors reading without the code: the code is what grants follow-ups.
    case_code?: string | null;
    access_type?: 'owned' | 'shared' | 'clinician';
    consultation_count: number;
    is_only_me: boolean;
    consultations: CaseConsultation[];
    pending_follow_up?: { session_id: string; clinician_name?: string | null; is_yours: boolean } | null;
};
