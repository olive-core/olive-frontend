export type UserRole = 'patient' | 'clinician' | 'attendant';

// Which experience the signed-in login is currently using. A login can hold
// several accounts, so the active view is chosen (defaulting to doctor) rather
// than fixed by a single stored role.
export type ActiveView = 'doctor' | 'attendant' | 'patient';

export type PatientProfile = {
    patientId: string;
    firstName: string;
    lastName?: string;
    isSelf: boolean;
};

export type Accounts = {
    isClinician: boolean;
    isAttendant: boolean;
    patients: PatientProfile[];
};

export type CheckUserResponse = {
    exists: boolean;
    accounts: Accounts;
};

// Raw API shapes (snake_case) mapped into the camelCase types above.
export type ApiPatientProfile = { patient_id: string; first_name: string; last_name?: string; is_self: boolean };
export type ApiAccounts = { is_clinician: boolean; is_attendant: boolean; patients: ApiPatientProfile[] };
export type ApiCheckUserResponse = { exists: boolean; accounts: ApiAccounts };

export type SendOtpResponse = {
    message: string;
    user_id: string;
};

export type VerifyOtpResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: {
        id: string;
    }
};
