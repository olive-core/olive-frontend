const CHAMBERS = [
    {
        chamber_id: "chamber-1",
        clinician_id: "doctor-1",
        hospital_name: "Ibn Sina Diagnostic and Consultation Center",
        room_no: "402",
        pad_config: {
            display_name: "Ibn Sina Diagnostic and Consultation Center, Dhanmondi",
            contact_lines: [
                { id: "l1", kind: "address", value: "House 12, Road 5, Dhanmondi, Dhaka 1205" },
                { id: "l2", kind: "phone", value: "01711-000000" },
                { id: "l3", kind: "hours", value: "Sat–Thu, 6:00 – 9:00 PM" },
                { id: "l4", kind: "custom", label: "Website", value: "www.ibnsinatrust.com" },
            ],
        },
    },
    {
        chamber_id: "chamber-2",
        clinician_id: "doctor-1",
        hospital_name: "Popular Diagnostic Centre",
        room_no: "12",
        pad_config: { display_name: "Popular Diagnostic Centre", paper: { mode: "preprinted", page_size: "legal" } },
    },
];

const data = (url: string) => {
    if (url.startsWith("/insights/")) return INSIGHTS[url.slice("/insights/".length)] ?? {};
    if (url.startsWith("/chamber")) return url === "/chamber" ? chambersForRun() : {};
    if (url.startsWith("/hospital")) return [{ hospital_id: "h1", name_en: "Square Hospital", district: "Dhaka" }];
    return {};
};

function chambersForRun() {
    return window.location.hash.includes("wizard") ? [] : CHAMBERS;
}

// A busy medicine specialist's quarter, so the insight screens render at the density
// they will really carry. Shapes mirror app/models/insights.py exactly.
const named = (rows: [string, number][]) => rows.map(([label, count]) => ({ key: label.toLowerCase(), label, count }));

const AGE_BANDS = ["0-5", "6-17", "18-39", "40-59", "60+"];
const bands = (counts: number[]) => AGE_BANDS.map((label, index) => ({ label, count: counts[index] }));

const INSIGHTS: Record<string, unknown> = {
    "filter-options": {
        complaints: named([["Fever", 78], ["Back pain", 54], ["Headache", 41], ["Cough", 36], ["Chest pain", 22]]),
        diagnoses:  named([["Type 2 diabetes mellitus", 38], ["Essential hypertension", 31], ["Mechanical back pain", 24]]),
        medicines:  named([["Paracetamol 500mg", 96], ["Metformin 500mg", 31], ["Amlodipine 5mg", 22]]),
        chambers:   [
            { chamber_id: "chamber-1", label: "Ibn Sina, Dhanmondi · Room 402" },
            { chamber_id: "chamber-2", label: "Popular Diagnostic Centre · Room 12" },
        ],
    },
    overview: {
        patient_count: 287,
        consultation_count: 412,
        age_bands: bands([46, 38, 121, 138, 69]),
        sex_counts: [{ label: "Male", count: 221 }, { label: "Female", count: 188 }, { label: "Not recorded", count: 3 }],
        peak_month: { label: "August 2026", count: 164 },
    },
    complaints: {
        consultation_count: 412,
        complaints: [
            { key: "fever", label: "Fever", count: 78, age_bands: bands([31, 22, 15, 7, 3]), dominant_band: "0-5", outlier: { label: "60+", count: 3 } },
            { key: "back pain", label: "Back pain", count: 54, age_bands: bands([0, 2, 14, 27, 11]), dominant_band: "40-59", outlier: { label: "6-17", count: 2 } },
            { key: "headache", label: "Headache", count: 41, age_bands: bands([2, 8, 16, 11, 4]), dominant_band: "18-39", outlier: null },
            { key: "cough", label: "Cough", count: 36, age_bands: bands([14, 9, 6, 4, 3]), dominant_band: "0-5", outlier: null },
            { key: "chest pain", label: "Chest pain", count: 22, age_bands: bands([0, 0, 4, 6, 12]), dominant_band: "60+", outlier: { label: "18-39", count: 4 } },
        ],
    },
    "complaint-diagnosis": {
        complaint: "Fever",
        consultation_count: 78,
        diagnoses: named([["Dengue fever", 24], ["Viral fever", 19], ["Enteric fever", 11], ["Urinary tract infection", 7], ["Pneumonia", 5]]),
        other_count: 12,
    },
    "follow-up": {
        consultation_count: 412,
        asked_count: 247,
        on_time: 79,
        late: 101,
        not_returned: 55,
        pending: 12,
        average_days_late: 11.6,
        by_diagnosis: [
            { key: "type 2 diabetes mellitus", label: "Type 2 diabetes mellitus", count: 38, returned: 31 },
            { key: "essential hypertension", label: "Essential hypertension", count: 31, returned: 23 },
            { key: "gastritis", label: "Gastritis", count: 21, returned: 6 },
            { key: "mechanical back pain", label: "Mechanical back pain", count: 17, returned: 3 },
        ],
        overdue_count: 9,
    },
    "follow-up/overdue": [
        { prescription_id: "rx-1", patient_id: "p-1", patient_name: "Nasrin Akter", due_date: "2026-09-02", days_overdue: 17, diagnoses: ["Type 2 diabetes mellitus"] },
        { prescription_id: "rx-2", patient_id: "p-2", patient_name: "Md. Sohel Rana", due_date: "2026-09-05", days_overdue: 14, diagnoses: ["Essential hypertension", "Dyslipidaemia"] },
        { prescription_id: "rx-3", patient_id: "p-3", patient_name: "Rahima Begum", due_date: "2026-09-09", days_overdue: 10, diagnoses: ["Gastritis"] },
    ],
    "early-returns": {
        consultation_count: 412,
        early_return_count: 14,
        window_days: 14,
        top_complaint: { key: "gastritis", label: "Gastritis", count: 5 },
        returns: [
            { prescription_id: "rx-4", patient_id: "p-4", patient_name: "Nasrin Akter", patient_age: 42, complaint: "Epigastric pain", days_between: 4 },
            { prescription_id: "rx-5", patient_id: "p-5", patient_name: "Md. Sohel Rana", patient_age: 28, complaint: "Fever", days_between: 5 },
            { prescription_id: "rx-6", patient_id: "p-6", patient_name: "Rahima Begum", patient_age: 54, complaint: "Epigastric pain", days_between: 6 },
            { prescription_id: "rx-7", patient_id: "p-7", patient_name: "Abdul Karim", patient_age: 61, complaint: "Cough", days_between: 9 },
        ],
    },
    trends: {
        period_label: "September 2026",
        period_count: 96,
        baseline_months: 5,
        baseline_count: 316,
        has_enough_history: true,
        complaints: [
            { key: "fever", label: "Fever", count: 30, current_share: 0.31, baseline_share: 0.12, direction: "rising" },
            { key: "skin rash", label: "Skin rash", count: 11, current_share: 0.11, baseline_share: 0.04, direction: "rising" },
            { key: "loose motion", label: "Loose motion", count: 9, current_share: 0.09, baseline_share: 0.08, direction: "steady" },
            { key: "back pain", label: "Back pain", count: 9, current_share: 0.09, baseline_share: 0.15, direction: "falling" },
        ],
    },
    protocol: {
        diagnosis: "Type 2 diabetes mellitus",
        patient_count: 38,
        consultation_count: 91,
        medicines: named([["Metformin 500mg", 31], ["Gliclazide 80mg", 14], ["Metformin 850mg", 6], ["Empagliflozin 10mg", 4]]),
        investigations: named([["Fasting blood sugar", 34], ["HbA1c", 12], ["Creatinine", 9], ["Lipid profile", 7]]),
        medicines_per_consultation: 2.4,
        practice_average_medicines: 2.7,
        return_rate: 0.81,
    },
    consultations: [
        { prescription_id: "rx-8", session_id: "s-8", created_at: "2026-09-16T10:12:00Z", patient_id: "p-8", patient_name: "Anirban Rahman", patient_sex: "male", patient_date_of_birth: "1984-04-02", diagnoses_summary: ["Dengue fever"], chief_complaints_summary: ["Fever"] },
        { prescription_id: "rx-9", session_id: "s-9", created_at: "2026-09-15T17:40:00Z", patient_id: "p-9", patient_name: "Sharmin Sultana", patient_sex: "female", patient_date_of_birth: "1996-11-20", diagnoses_summary: ["Viral fever", "Pharyngitis"], chief_complaints_summary: ["Fever", "Sore throat"] },
        { prescription_id: "rx-10", session_id: "s-10", created_at: "2026-09-15T09:05:00Z", patient_id: "p-10", patient_name: "Kamrul Hasan", patient_sex: "male", patient_date_of_birth: "1971-01-09", diagnoses_summary: ["Enteric fever"], chief_complaints_summary: ["Fever"] },
    ],
};

const api = {
    get:    async (url: string) => ({ data: data(url) }),
    post:   async () => ({ data: {} }),
    put:    async () => ({ data: {} }),
    delete: async () => ({ data: {} }),
};

export default api;
