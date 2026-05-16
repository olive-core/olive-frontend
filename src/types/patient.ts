export type PatientByPhoneResponse = {
    user_id: string;
}

export type PatientInfoType = {
    date_of_birth: string;
    user_id: string;
    first_name: string;
    last_name: string;
    sex?: 'male' | 'female' | 'non_binary';
}

export type PatientUpdatePayload = {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    sex?: 'male' | 'female' | 'non_binary';
}

export type ShowContentStatus =
    | { status: "NOTHING" }
    | { status: "PATIENT_INFO", userId: string }
    | { status: "PATIENT_CREATE", initialValues: { name?: string, age?: string, sex?: 'male' | 'female' | 'non_binary' }, userId?: string }
    | { status: "LOADING" }
    | { status: "ERROR", message: string }


export type HistoryType = {
    prescription_id: string;
    session_id: string;
    created_at: string;
    diagnoses_summary: string[];
    clinician_id: string;
    clinician_first_name: string;
    clinician_last_name: string;
}

export type PatientPrescriptionListItem = HistoryType;

export type RxRoutine = {
    gap_hour: number;
    after_lunch: boolean;
    after_dinner: boolean;
    before_lunch: boolean;
    before_dinner: boolean;
    after_breakfast: boolean;
    before_breakfast: boolean;
}

export type RxItem = {
    dosage: string;
    routine: RxRoutine;
    duration: string;
    trade_name: string;
    medicine_id: string | null;
    generic_name: string;
}

export type DiagnosisItem = {
    dn_id: string | null;
    name_text: string;
}

export type ChiefComplaintItem = {
    notes: string;
    ccn_id: string | null;
    duration: string;
    name_text: string;
}

export type PrescriptionData = {
    rx_list: RxItem[];
    diagnoses: DiagnosisItem[];
    histories: unknown[];
    advice_list: unknown[];
    follow_up_days: number | null;
    investigations: unknown[];
    follow_up_notes: string | null;
    on_examinations: unknown[];
    chief_complaints: ChiefComplaintItem[];
}

export type PrescriptionType = {
    prescription_id: string;
    session_id: string;
    clinician_id: string;
    clinician_first_name: string;
    clinician_last_name: string;
    patient_id: string;
    patient_first_name: string;
    patient_last_name: string;
    prescription_data: PrescriptionData;
    created_at: string;
    updated_at: string;
}
