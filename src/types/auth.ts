export type DoesUserExistResponse = {
    exists: boolean;
    role?: string[];
};

export type SendOtpResponse = {
    message: string;
};

export type VerifyOtpResponse = {
    accessToken: string;
    refreshToken: string;
    userId: string;
};