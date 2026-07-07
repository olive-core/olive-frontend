import { useAuthStore } from "@/stores/auth-store";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: "/api/v1",
});
export default api;


api.interceptors.request.use(
    (config) => {

        const token = useAuthStore.getState().accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Access tokens expire after ~1h. On a 401, refresh once and retry the request;
// concurrent 401s share one refresh call. We deliberately do NOT log the user
// out on a failed refresh — the product principle is that a user is only signed
// out when they choose to be (matches how doctors/patients behave), so a stale
// token just surfaces as a retryable error, never a forced logout.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return null;
    try {
        // Plain axios: the api instance would re-enter this interceptor.
        const response = await axios.post("/api/v1/auth/refresh-token", { refresh_token: refreshToken });
        useAuthStore.setState({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        });
        return response.data.access_token;
    } catch {
        return null;
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
        if (error.response?.status === 401 && original && !original._retried) {
            original._retried = true;
            refreshPromise = refreshPromise ?? refreshAccessToken();
            const token = await refreshPromise;
            refreshPromise = null;
            if (token) {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            }
        }
        return Promise.reject(error);
    }
);
