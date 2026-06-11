import api from "@/lib/axios";

import { TERMS_VERSION } from "@/lib/terms";
import type { ClinicianType } from "@/types/shared";
import type { SendOtpResponse, DoesUserExistResponse, VerifyOtpResponse, UserRole } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";


type PendingPatient = {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    sex?: string;
};

interface AuthStoreType {
    isLoggedIn: boolean;
    phoneNumber: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    role?: UserRole;
    clinician?: ClinicianType;
    pendingPatient?: PendingPatient;

    logout: () => void;
    doesUserExist: (phone: string) => Promise<{ exists: boolean; role?: UserRole }>;
    sendOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;

    storeClinicianInfo: (data: ClinicianType) => void;
    createClinicianProfile: (phone: string, otp: string) => Promise<void>;

    storePendingPatient: (data: PendingPatient) => void;
    createPatientProfile: (phone: string, otp: string) => Promise<void>;
}

export const useAuthStore = create<AuthStoreType>()(
    persist(
        (set) => {

            return ({
                isLoggedIn: false,
                phoneNumber: "",
                accessToken: undefined,
                refreshToken: undefined,
                userId: undefined,
                role: undefined,
                clinician: undefined,
                pendingPatient: undefined,

                doesUserExist: async (phone: string) => {
                    const response = await api.post<DoesUserExistResponse>(`/auth/check-user`, { phone });
                    const role = response.data.role as UserRole | undefined;
                    set({ role });
                    return { exists: response.data.exists, role };
                },

                sendOtp: async (phone: string) => {
                    const res = await api.post<SendOtpResponse>(`/auth/send-otp`, { phone });
                    set({ phoneNumber: phone, userId: res.data?.user_id });
                },

                verifyOtp: async (phone: string, otp: string) => {
                    const response = await api.post<VerifyOtpResponse>(`/auth/verify-otp`, { phone, otp });

                    set({
                        isLoggedIn: true,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        userId: response.data.user.id,
                    });
                },

                storeClinicianInfo: (data: ClinicianType) => {
                    set({
                        clinician: {
                            bmdcNo: data.bmdcNo,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            generate_ai_draft: data.generate_ai_draft,
                            specializations: data.specializations,
                            qualification: data.qualification,
                        }
                    })
                },

                createClinicianProfile: async (phone: string, otp: string) => {
                    const clinician = useAuthStore.getState().clinician;
                    const response = await api.post(`/clinician`, {
                        bmdc_no: clinician?.bmdcNo,
                        qualification: clinician?.qualification || undefined,
                        specializations: clinician?.specializations?.length ? clinician.specializations : undefined,
                        first_name: clinician?.firstName || "",
                        last_name: clinician?.lastName || "",
                        phone: phone,
                        otp: otp,
                        terms_version: TERMS_VERSION,
                    });
                    set({
                        isLoggedIn: true,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        userId: response.data.user_id,
                        role: 'clinician',
                    });
                },


                storePendingPatient: (data: PendingPatient) => set({ pendingPatient: data }),

                createPatientProfile: async (phone: string, otp: string) => {
                    const pendingPatient = useAuthStore.getState().pendingPatient;
                    const response = await api.post('/patient/register', {
                        first_name: pendingPatient?.firstName,
                        last_name: pendingPatient?.lastName,
                        phone,
                        otp,
                        date_of_birth: pendingPatient?.dateOfBirth || undefined,
                        sex: pendingPatient?.sex || undefined,
                    });
                    set({
                        isLoggedIn: true,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        userId: response.data.user_id,
                        role: 'patient',
                        pendingPatient: undefined,
                    });
                },

                logout: () => set({
                    isLoggedIn: false,
                    accessToken: undefined,
                    refreshToken: undefined,
                    userId: undefined,
                    role: undefined,
                    clinician: undefined,
                    pendingPatient: undefined,
                }),
            })
        },
        { name: "auth-store" }
    )
)