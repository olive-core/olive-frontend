export type ChiefComplaintType = {
    // id: string;
    name: string;
    duration?: string;
    notes?: string;
};

export type HistoryType = {
    // id: string;
    name: string;
    duration?: string;
    notes?: string;
};

export type DiagnosisType = {
    // id: string;
    name: string;
    icd_code?: string;
    confidence?: number;
    clinical_reasoning?: string;
};

export type InvestigationType = {
    // id: string;
    name: string;
    notes?: string;
    reason?: string;
    priority?: string;
};

export type ListInfoType = ChiefComplaintType | HistoryType | DiagnosisType | InvestigationType;

export type MeedicineType = {
    name: string;
    value: string;
    trade_name?: string;
    generic_name?: string;
    dosage?: string;
    notes?: string;
    reasoning?: string;
    routine: {
        beforeBreakfast?: boolean;
        afterBreakfast?: boolean;
        beforeLunch?: boolean;
        afterLunch?: boolean;
        beforeDinner?: boolean;
        afterDinner?: boolean;
        gapHours?: number;
    }
}

export type VitalsType = {
    bp_systolic?:      number | null;
    bp_diastolic?:     number | null;
    pulse?:            number | null;
    temperature?:      number | null;
    respiratory_rate?: number | null;
    spo2?:             number | null;
    weight?:           number | null;
    height?:           number | null;
};

export type FollowUpType = {
    follow_up_days:  number | null;
    follow_up_notes: string | null;
};

export type ListInfoFieldName = "chief-complaint" | "history" | "diagnosis" | "investigation"

export type PrescriptionResponseType = {
    session_id: string;
    variant_used: string;
    timings: {
        total_duration: number;
        layer_00_total: number;
        layer_01_total: number;
        layer_02_total: number;
        layer_03_total: number;
        layer_02_diagnosis_rag: number;
        layer_02_medicine_rag: number;
    };
    chief_complaints: {
        complaint_name: string;
        clinical_note: string;
    }[];
    history: {
        history_name: string;
        clinical_note: string;
    }[];
    summary: string;
    diagnoses: {
        diagnosis_name: string;
        icd_code: string;
        confidence: number;
        clinical_reasoning: string;
    }[];
    medicines: {
        generic_name: string;
        trade_name: string;
        dosage: string;
        routine: {
            gap_hours: number;
            meal_times: string[];
        };
        duration: string;
        purpose: string;
    }[];
    investigations: {
        investigation_name: string;
        reason: string;
        priority: string;
    }[];
    advice: string[];
    vitals?: VitalsType;
    follow_up?: FollowUpType;
}