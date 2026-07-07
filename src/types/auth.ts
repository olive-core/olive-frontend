export type UserRole = 'patient' | 'clinician' | 'attendant';

export type DoesUserExistResponse = {
    exists: boolean;
    role?: string;
};

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