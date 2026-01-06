export type PatientByPhoneResponse = {
    user_id: string;
}

export type PatientInfoType = {
    date_of_birth: string;
    user_id: string;
    // TODO: Add other fields as necessary
}

export type ShowContentStatus =
    | { status: "NOTHING" }
    | { status: "PATIENT_INFO", userId: string }
    | { status: "PATIENT_CREATE", initialValues: { name?: string, age?: string, sex?: 'male' | 'female' | 'non_binary' }, userId?: string }
    | { status: "LOADING" }
    | { status: "ERROR", message: string }

export type HistoryType = {
    id: string;
    timestamp: string;
    relativeTime: string;
    description: string;
}