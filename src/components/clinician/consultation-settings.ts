export type ConsultationSettingKey = "prescription_enabled" | "prescription_sms_enabled";

export interface ConsultationSetting {
    key:          ConsultationSettingKey;
    label:        string;
    description:  string;
    /** What actually changes for the doctor and their patients once this goes off. */
    consequences: string[];
    /** Offered when turning off, so the answer names a workflow gap rather than a mood. */
    reasons:      string[];
}

export const CONSULTATION_SETTINGS: ConsultationSetting[] = [
    {
        key:         "prescription_enabled",
        label:       "Write prescriptions in Olive",
        description: "Off means Olive keeps the clinical note only — for doctors who prescribe on another system.",
        consequences: [
            "Olive will stop drafting prescriptions after each consultation.",
            "Your consultations will be saved as clinical notes only.",
            "Patients will not receive a prescription from Olive.",
        ],
        reasons: [
            "I already prescribe on another system",
            "The drafted prescriptions need too much correction",
            "Medicines I use are missing or hard to find",
            "I only want Olive for my own notes",
        ],
    },
    {
        key:         "prescription_sms_enabled",
        label:       "Text prescriptions to patients",
        description: "Off means patients leave with the printout only, and get no SMS link from Olive.",
        consequences: [
            "Patients will stop receiving an SMS link to their prescription.",
            "They will only have whatever you print and hand them.",
            "Patients who lose the printout will have no way to view it again.",
        ],
        reasons: [
            "My patients share phones — this is a privacy risk",
            "Patients were confused by the message",
            "I hand over a printout and that is enough",
            "Patients asked me to stop the messages",
        ],
    },
];
