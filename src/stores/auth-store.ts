import axios from "axios";

import api from "@/lib/axios";
import { queryClient } from "@/lib/query-client";

import { TERMS_VERSION } from "@/lib/terms";
import type { ClinicianType } from "@/types/shared";
import type {
    Accounts,
    ActiveView,
    ApiCheckUserResponse,
    CheckUserResponse,
    SendOtpResponse,
    VerifyOtpResponse,
} from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";


type PendingPatient = {
    name: string;
    dateOfBirth?: string;
    sex?: string;
};

type PendingAttendant = {
    name: string;
};

const emptyAccounts = (): Accounts => ({ isClinician: false, isAttendant: false, patients: [] });

function mapAccounts(api?: ApiCheckUserResponse["accounts"]): Accounts {
    return {
        isClinician: api?.is_clinician ?? false,
        isAttendant: api?.is_attendant ?? false,
        clinicianName: api?.clinician_name ?? null,
        attendantName: api?.attendant_name ?? null,
        patients: (api?.patients ?? []).map((p) => ({
            patientId: p.patient_id,
            name: p.name,
        })),
    };
}

// A login can hold several accounts; the doctor experience wins by default, then
// attendant, then patient.
function defaultView(accounts: Accounts): ActiveView {
    if (accounts.isClinician) return "doctor";
    if (accounts.isAttendant) return "attendant";
    return "patient";
}

function firstPatientId(accounts: Accounts): string | undefined {
    return accounts.patients[0]?.patientId;
}

interface AuthStoreType {
    isLoggedIn: boolean;
    phoneNumber: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    accounts: Accounts;
    activeView?: ActiveView;
    activePatientId?: string;
    clinician?: ClinicianType;
    pendingPatient?: PendingPatient;
    pendingAttendant?: PendingAttendant;

    logout: () => void;
    checkUser: (phone: string) => Promise<CheckUserResponse>;
    sendOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string, view?: ActiveView, patientId?: string) => Promise<void>;

    setActiveView: (view: ActiveView) => void;
    setActivePatientId: (patientId?: string) => void;

    storeClinicianInfo: (data: Partial<ClinicianType>) => void;
    createClinicianProfile: (phone: string, otp: string) => Promise<void>;

    storePendingPatient: (data: PendingPatient) => void;
    createPatientProfile: (phone: string, otp: string) => Promise<void>;

    storePendingAttendant: (data: PendingAttendant) => void;
    createAttendantProfile: (phone: string, otp: string) => Promise<void>;
}

export const useAuthStore = create<AuthStoreType>()(
    persist(
        (set, get) => ({
            isLoggedIn: false,
            phoneNumber: "",
            accessToken: undefined,
            refreshToken: undefined,
            userId: undefined,
            accounts: emptyAccounts(),
            activeView: undefined,
            activePatientId: undefined,
            clinician: undefined,
            pendingPatient: undefined,
            pendingAttendant: undefined,

            checkUser: async (phone: string) => {
                const response = await api.post<ApiCheckUserResponse>(`/auth/check-user`, { phone });
                const accounts = mapAccounts(response.data.accounts);
                set({ accounts });
                return { exists: response.data.exists, accounts };
            },

            sendOtp: async (phone: string) => {
                const res = await api.post<SendOtpResponse>(`/auth/send-otp`, { phone });
                set({ phoneNumber: phone, userId: res.data?.user_id });
            },

            verifyOtp: async (phone: string, otp: string, view?: ActiveView, patientId?: string) => {
                const response = await api.post<VerifyOtpResponse>(`/auth/verify-otp`, { phone, otp });
                const accounts = get().accounts;
                const activeView = view ?? defaultView(accounts);
                set({
                    isLoggedIn: true,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    userId: response.data.user.id,
                    activeView,
                    activePatientId: activeView === "patient" ? (patientId ?? firstPatientId(accounts)) : undefined,
                });
            },

            setActiveView: (view: ActiveView) =>
                set((state) => ({
                    activeView: view,
                    activePatientId: view === "patient" ? (state.activePatientId ?? firstPatientId(state.accounts)) : state.activePatientId,
                })),

            setActivePatientId: (patientId?: string) => set({ activePatientId: patientId }),

            storeClinicianInfo: (data: Partial<ClinicianType>) => {
                set((state) => ({
                    clinician: { ...state.clinician, ...data } as ClinicianType,
                }))
            },

            createClinicianProfile: async (phone: string, otp: string) => {
                const clinician = get().clinician;
                const response = await api.post(`/clinician`, {
                    bmdc_no: clinician?.bmdcNo,
                    name: clinician?.name || "",
                    phone: phone,
                    otp: otp,
                    terms_version: TERMS_VERSION,
                });
                set((state) => ({
                    isLoggedIn: true,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    userId: response.data.user_id,
                    accounts: { ...state.accounts, isClinician: true },
                    activeView: "doctor",
                }));
            },

            storePendingPatient: (data: PendingPatient) => set({ pendingPatient: data }),

            createPatientProfile: async (phone: string, otp: string) => {
                const pendingPatient = get().pendingPatient;
                const response = await api.post('/patient/register', {
                    name: pendingPatient?.name,
                    phone,
                    otp,
                    date_of_birth: pendingPatient?.dateOfBirth || undefined,
                    sex: pendingPatient?.sex || undefined,
                });
                const patientId = response.data.patient_id;
                set((state) => ({
                    isLoggedIn: true,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    userId: response.data.user_id,
                    accounts: {
                        ...state.accounts,
                        patients: [
                            ...state.accounts.patients,
                            { patientId, name: pendingPatient?.name || "" },
                        ],
                    },
                    activeView: "patient",
                    activePatientId: patientId,
                    pendingPatient: undefined,
                }));
            },

            storePendingAttendant: (data: PendingAttendant) => set({ pendingAttendant: data }),

            createAttendantProfile: async (phone: string, otp: string) => {
                const pendingAttendant = get().pendingAttendant;
                const response = await api.post('/attendant/register', {
                    name: pendingAttendant?.name,
                    phone,
                    otp,
                });
                set((state) => ({
                    isLoggedIn: true,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    userId: response.data.user_id,
                    accounts: { ...state.accounts, isAttendant: true },
                    activeView: "attendant",
                    pendingAttendant: undefined,
                }));
            },

            logout: () => {
                // Revoke the session server-side too. Refresh tokens no longer expire on
                // their own, so one abandoned here would stay usable indefinitely.
                // Fire-and-forget: signing out locally must never depend on the network.
                // Plain axios rather than the api instance, to stay out of the 401
                // interceptor — that interceptor calls logout() itself on a dead session,
                // which would re-enter this.
                const { refreshToken } = get();
                if (refreshToken) {
                    axios.post("/api/v1/auth/logout", { refresh_token: refreshToken }).catch(() => undefined);
                }
                // Drop every cached query so the next user on this device (shared attendant
                // desk, shared patient phone) never sees the previous user's data flash in
                // before their own fetch resolves.
                queryClient.clear();
                set({
                    isLoggedIn: false,
                    accessToken: undefined,
                    refreshToken: undefined,
                    userId: undefined,
                    accounts: emptyAccounts(),
                    activeView: undefined,
                    activePatientId: undefined,
                    clinician: undefined,
                    pendingPatient: undefined,
                    pendingAttendant: undefined,
                });
            },
        }),
        { name: "auth-store" }
    )
)
