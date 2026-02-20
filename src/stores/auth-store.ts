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

    storeClinicianInfo: (data: ClinicianType) => void;
    createClinicianProfile: (phone: string, otp: string) => Promise<void>;
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
                            lastName: data.lastName
                        }
                    })
                },

                createClinicianProfile: async (phone: string, otp: string) => {

                    const clinician = useAuthStore.getState().clinician;

                    const response = await api.post(`/clinician`, {
                        bmdc_no: clinician?.bmdcNo,
                        medicine_company_ids: [],
                        qualification: "",
                        specializations: [],
                        first_name: clinician?.firstName || "",
                        last_name: clinician?.lastName || "",
                        phone: phone,
                        otp: otp,
                        userId: useAuthStore.getState().userId,
                    });
                    console.log(response.data)
                    // set({ clinician: response.data });
                    set({
                        isLoggedIn: true,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        userId: response.data.user.id,
                    });
                },


                logout: () => set({ isLoggedIn: false }),
            })
        },
        { name: "auth-store" }
    )
)