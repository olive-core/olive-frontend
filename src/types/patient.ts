export type PatientByPhoneResponse = {
    user_id: string;
    // TODO: Add other fields as necessary
}

export type HistoryType = {
    id: string;
    timestamp: string;
    relativeTime: string;
    description: string;
}