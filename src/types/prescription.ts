import type { MedicineCategory } from "@/lib/dosage-form";

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

export type MedicineDose = {
    amount?: string;
    unit?: string;
    diluent?: MedicineDose;   // nebulizer dilution volume (e.g. 2.5 ml); empty amount = not diluted
};

export type MedicineDuration = {
    value?: number | null;
    unit?: string;
    preset?: string;
};

export type MedicineSchedule = {
    timing?: "before" | "after" | "with" | "empty" | "bedtime";
    morning?: number;   // per-meal counts (support 0.5) — meal mode
    noon?: number;
    night?: number;
    gapHours?: number;  // interval mode
    code?: string;      // OD/BD/TDS/QDS/Q6H/Q8H/Q12H/HS/SOS/Stat — code mode
};

export type MeedicineType = {
    name: string;
    value: string;
    trade_name?: string;
    generic_name?: string;

    // Structured fields driving the type-aware editor.
    dosage_form?: string;      // raw value from the medicine table
    type?: MedicineCategory;   // normalized canonical category
    route?: string;
    site?: string;
    dose?: MedicineDose;
    schedule?: MedicineSchedule;
    frequencyCode?: string;
    duration?: MedicineDuration;
    instructions?: string;

    // Kept for back-compat / composition (rendered by older views, sent to backend).
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
        // Structured fields from ARIS Stage 4 (optional — older variants/drafts omit them).
        type?: MedicineCategory;
        dosage_form?: string;
        route?: string;
        site?: string;
        dose?: MedicineDose;
        schedule?: {
            timing?: MedicineSchedule["timing"];
            morning?: number;
            noon?: number;
            night?: number;
            gap_hours?: number;   // snake_case as sent by the backend
            code?: string;
        };
        duration_value?: number | null;
        duration_unit?: string;
        duration_preset?: string;
        frequency_code?: string;
        instructions?: string;
    }[];
    investigations: {
        investigation_name: string;
        reason: string;
        priority: string;
    }[];
    advice: string[];
    safety_net?: string[];
    vitals?: VitalsType;
    follow_up?: FollowUpType;
}