export type ChiefComplaintType = {
    name: string;
    duration?: string;
    notes?: string;
};

export type HistoryType = {
    name: string;
    duration?: string;
    notes?: string;
};

export type DiagnosisType = {
    name: string;
    icd_code?: string;
    confidence?: number;
    clinical_reasoning?: string;
};

export type InvestigationType = {
    name: string;
    notes?: string;
};

export type ListInfoType = ChiefComplaintType | HistoryType | DiagnosisType | InvestigationType;

export type MeedicineType = {
    name: string;
    value: string;
    dosage?: string;
    notes?: string;
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
}