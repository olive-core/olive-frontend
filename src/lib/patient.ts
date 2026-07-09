import api from "@/lib/axios";

// A patient reachable behind a phone (point-of-care picker / profile list).
export type PatientSummary = {
    patient_id: string;
    first_name: string;
    last_name?: string;
    date_of_birth?: string;
    sex?: "male" | "female" | "non_binary";
};

// A possible duplicate surfaced by the gate, with its numbers masked.
export type SimilarMatch = {
    patient_id: string;
    first_name: string;
    last_name?: string;
    sex?: string;
    age?: number;
    masked_numbers: string[];
};

export type PatientNumber = {
    user_id: string;
    phone?: string;
};

// Age in whole years -> an approximate date of birth (Jan 1 of the birth year).
// Age is collected instead of an exact date to keep entry fast at the desk and sign-up.
// Built as a plain string, not via Date/toISOString, which would shift to the previous
// day (and year) once serialized to UTC from a +6 timezone.
export const dobFromAge = (age: string) =>
    `${new Date().getFullYear() - parseInt(age, 10)}-01-01`;

export const lookupByPhone = (phone: string) =>
    api.post<PatientSummary[]>("/patient/lookup-by-phone", { phone }).then((r) => r.data);

export const findSimilar = (payload: { first_name: string; last_name?: string; sex: string; age: number }) =>
    api.post<SimilarMatch[]>("/patient/find-similar", payload).then((r) => r.data);

export const createPatient = (payload: {
    first_name: string;
    last_name?: string;
    phone: string;
    date_of_birth?: string;
    sex?: string;
}) => api.post<PatientSummary>("/patient", payload).then((r) => r.data);

export const linkPhone = (patientId: string, phone: string) =>
    api.post(`/patient/${patientId}/link-phone`, { phone });

export const getPatient = (patientId: string) =>
    api.get<PatientSummary>(`/patient/${patientId}`).then((r) => r.data);

export const myProfiles = () =>
    api.get<PatientSummary[]>("/patient/my-profiles").then((r) => r.data);

export const listNumbers = (patientId: string) =>
    api.get<PatientNumber[]>(`/patient/${patientId}/numbers`).then((r) => r.data);

export const addNumber = (patientId: string, phone: string, otp: string) =>
    api.post(`/patient/${patientId}/numbers`, { phone, otp });

export const removeNumber = (patientId: string, targetUserId: string) =>
    api.delete(`/patient/${patientId}/numbers/${targetUserId}`);
