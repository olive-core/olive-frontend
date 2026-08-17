import api from "@/lib/axios";
import type {
    AttendantChamber,
    Chamber,
    ChamberAttendant,
    Hospital,
    QueueEntry,
} from "@/types/attendant-queue";

// --- hospitals ---
export const listHospitals = () =>
    api.get<Hospital[]>("/hospital").then((r) => r.data);

export const createHospital = (nameEn: string) =>
    api.post<Hospital>("/hospital", { name_en: nameEn }).then((r) => r.data);

// --- chambers (doctor) ---
export const listChambers = () =>
    api.get<Chamber[]>("/chamber").then((r) => r.data);

export const createChamber = (payload: {
    clinician_id: string;
    hospital_id: string;
    room_no?: string;
}) => api.post<Chamber>("/chamber", payload).then((r) => r.data);

export const updateChamber = (chamberId: string, payload: Partial<Chamber>) =>
    api.put<Chamber>(`/chamber/${chamberId}`, payload).then((r) => r.data);

export const deleteChamber = (chamberId: string) =>
    api.delete(`/chamber/${chamberId}`);

// --- chamber attendants (doctor) ---
export const listChamberAttendants = (chamberId: string) =>
    api.get<ChamberAttendant[]>(`/chamber/${chamberId}/attendant`).then((r) => r.data);

export const addChamberAttendant = (chamberId: string, phone: string) =>
    api.post<ChamberAttendant>(`/chamber/${chamberId}/attendant`, { phone }).then((r) => r.data);

export const revokeChamberAttendant = (chamberId: string, attendantUserId: string) =>
    api.delete(`/chamber/${chamberId}/attendant/${attendantUserId}`);

// --- attendant (self) ---
export const listMyChambers = () =>
    api.get<AttendantChamber[]>("/attendant/me/chambers").then((r) => r.data);

export const listMyInvites = () =>
    api.get<AttendantChamber[]>("/attendant/me/invites").then((r) => r.data);

export const acceptInvite = (chamberId: string) =>
    api.post(`/attendant/me/invites/${chamberId}/accept`);

export const declineInvite = (chamberId: string) =>
    api.post(`/attendant/me/invites/${chamberId}/decline`);

// --- queue ---
export const listQueue = (chamberId: string) =>
    api.get<QueueEntry[]>(`/queue/chamber/${chamberId}`).then((r) => r.data);

export const addToQueue = (chamberId: string, patientId: string, contactPhone?: string) =>
    api.post<QueueEntry>("/queue", {
        chamber_id: chamberId,
        patient_id: patientId,
        ...(contactPhone ? { contact_phone: contactPhone } : {}),
    }).then((r) => r.data);

export const reorderQueue = (chamberId: string, orderedIds: string[]) =>
    api.put<QueueEntry[]>("/queue/reorder", { chamber_id: chamberId, ordered_ids: orderedIds }).then((r) => r.data);

export const removeQueueEntry = (entryId: string) =>
    api.delete(`/queue/${entryId}`);

export const startConsultation = (entryId: string, followUpOfSessionId?: string) =>
    api.post<{ queue_entry_id: string; session_id: string }>(`/queue/${entryId}/start`, {
        ...(followUpOfSessionId ? { follow_up_of_session_id: followUpOfSessionId } : {}),
    }).then((r) => r.data);

export const completeQueueEntry = (entryId: string) =>
    api.post(`/queue/${entryId}/complete`);

export const releaseQueueSession = (sessionId: string) =>
    api.post(`/queue/session/${sessionId}/release`);
