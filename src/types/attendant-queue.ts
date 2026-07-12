export type Hospital = {
    hospital_id: string;
    name_en?: string | null;
    district?: string | null;
};

export type Chamber = {
    chamber_id: string;
    clinician_id: string;
    hospital_id?: string | null;
    hospital_name?: string | null;
    room_no?: string | null;
    active_count?: number;
    is_active?: boolean;
    pad_config?: import("@/lib/chamber-pad").PadConfigApi | null;
    created_at?: string;
    updated_at?: string;
};

export type ChamberAttendant = {
    id: string;
    chamber_id: string;
    attendant_user_id: string;
    status: string;
    name?: string;
    phone?: string;
};

export type AttendantChamber = {
    chamber_id: string;
    room_no?: string | null;
    hospital_id?: string | null;
    hospital_name?: string | null;
    clinician_name?: string | null;
};

/** A chamber is displayed by its hospital's name (private chambers have their own hospital row). */
export const chamberLabel = (chamber: { hospital_name?: string | null }) =>
    chamber.hospital_name || "Chamber";

/** The room is the disambiguator when a hospital hosts more than one chamber. */
export const chamberRoom = (chamber: { room_no?: string | null }) =>
    chamber.room_no ? `Room ${chamber.room_no}` : "";

export type QueueStatus = 'waiting' | 'in_room' | 'completed' | 'removed';

export type QueueEntry = {
    queue_entry_id: string;
    chamber_id: string;
    patient_id: string;
    session_id?: string | null;
    status: QueueStatus;
    position: number;
    name?: string;
    sex?: string;
    age?: number;
};
