export type LabelCount = {
    label: string;
    count: number;
}

/** A row the doctor can click to filter by; `key` is what the filter takes. */
export type NamedCount = LabelCount & {
    key: string;
}

export type OverviewInsight = {
    patient_count:      number;
    consultation_count: number;
    age_bands:          LabelCount[];
    sex_counts:         LabelCount[];
    peak_month:         LabelCount | null;
}

export type ComplaintBreakdown = NamedCount & {
    age_bands:     LabelCount[];
    dominant_band: string | null;
    outlier:       LabelCount | null;
}

export type ComplaintsInsight = {
    consultation_count: number;
    complaints:         ComplaintBreakdown[];
}

export type ComplaintDiagnosisInsight = {
    complaint:          string | null;
    consultation_count: number;
    diagnoses:          NamedCount[];
    other_count:        number;
}

export type DiagnosisReturnRate = NamedCount & {
    returned: number;
}

export type FollowUpInsight = {
    consultation_count: number;
    asked_count:        number;
    on_time:            number;
    late:               number;
    not_returned:       number;
    pending:            number;
    average_days_late:  number | null;
    by_diagnosis:       DiagnosisReturnRate[];
    overdue_count:      number;
}

export type OverdueFollowUp = {
    prescription_id: string;
    patient_id:      string;
    patient_name:    string | null;
    due_date:        string;
    days_overdue:    number;
    diagnoses:       string[];
}

export type EarlyReturn = {
    prescription_id: string;
    patient_id:      string;
    patient_name:    string | null;
    patient_age:     number | null;
    complaint:       string;
    days_between:    number;
}

export type EarlyReturnsInsight = {
    consultation_count: number;
    early_return_count: number;
    window_days:        number;
    top_complaint:      NamedCount | null;
    returns:            EarlyReturn[];
}

export type TrendDirection = "rising" | "falling" | "steady";

export type ComplaintTrend = NamedCount & {
    current_share:  number;
    baseline_share: number;
    direction:      TrendDirection;
}

export type TrendsInsight = {
    period_label:       string;
    period_count:       number;
    baseline_months:    number;
    baseline_count:     number;
    has_enough_history: boolean;
    complaints:         ComplaintTrend[];
}

export type ProtocolInsight = {
    diagnosis:                  string | null;
    patient_count:              number;
    consultation_count:         number;
    medicines:                  NamedCount[];
    investigations:             NamedCount[];
    medicines_per_consultation: number | null;
    practice_average_medicines: number | null;
    return_rate:                number | null;
}

export type ChamberOption = {
    chamber_id: string;
    label:      string;
}

export type InsightFilterOptions = {
    complaints: NamedCount[];
    diagnoses:  NamedCount[];
    medicines:  NamedCount[];
    chambers:   ChamberOption[];
}
