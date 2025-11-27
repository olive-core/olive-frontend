import api from "@/lib/axios";

import type { ClinicianType } from "@/types/shared";
import type { SendOtpResponse, DoesUserExistResponse, VerifyOtpResponse } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";



interface AuthStoreType {
    isLoggedIn: boolean;
    phoneNumber: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    clinician?: ClinicianType;

    logout: () => void;
    doesUserExist: (phone: string) => Promise<boolean>;
    sendOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string) => Promise<void>;

    createClinicianProfile: (data: ClinicianType) => Promise<void>;
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
                clinician: undefined,

                doesUserExist: async (phone: string) => {
                    const response = await api.post<DoesUserExistResponse>(`/auth/check-user`, { phone });
                    return response.data.exists;
                },

                sendOtp: async (phone: string) => {
                    await api.post<SendOtpResponse>(`/auth/send-otp`, { phone });
                    set({ phoneNumber: phone });
                },

                verifyOtp: async (phone: string, otp: string) => {
                    const response = await api.post<VerifyOtpResponse>(`/auth/verify-otp`, { phone, otp });

                    set({
                        isLoggedIn: true,
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken,
                        userId: response.data.userId,
                    });
                },

                createClinicianProfile: async (data: ClinicianType) => {
                    const userId = useAuthStore.getState().userId;
                    if (!userId) throw new Error("User ID is missing");

                    const response = await api.post(`/clinician`, {
                        bmdc_no: data.bmdcNo,
                        qualification: data.qualification,
                        specializations: data.specializations,
                        user_id: userId
                    });
                    console.log(response.data)
                    set({ clinician: data });
                },


                logout: () => set({ isLoggedIn: false }),
            })
        },
        { name: "auth-store" }
    )
)