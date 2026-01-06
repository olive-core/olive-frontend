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
};

export type InvestigationType = {
    name: string;
    notes?: string;
};

export type ListInfoType = ChiefComplaintType | HistoryType | DiagnosisType | InvestigationType;

export type MeedicineType = {
    name: string;
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

