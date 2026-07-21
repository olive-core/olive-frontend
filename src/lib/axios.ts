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

const AUTH_STORE_KEY = "auth-store";
const REFRESH_LOCK = "olive-auth-refresh";

type SessionRenewal = { accessToken: string | null; sessionExpired: boolean };

type Tokens = { accessToken?: string; refreshToken?: string };

function tokensInStorage(): Tokens | undefined {
    try {
        const raw = localStorage.getItem(AUTH_STORE_KEY);
        return raw ? JSON.parse(raw)?.state : undefined;
    } catch {
        return undefined;
    }
}

// Storage is shared between tabs and this tab's in-memory copy is not, so storage wins.
// Memory is the fallback for when storage is unreadable (private mode, blocked, quota).
function latestTokens(): Tokens {
    const inMemory = useAuthStore.getState();
    const stored = tokensInStorage();
    return {
        accessToken: stored?.accessToken ?? inMemory.accessToken,
        refreshToken: stored?.refreshToken ?? inMemory.refreshToken,
    };
}

async function exchangeRefreshToken(refreshToken: string): Promise<SessionRenewal> {
    try {
        // Plain axios, since the api instance would re-enter this interceptor.
        const { data } = await axios.post("/api/v1/auth/refresh-token", { refresh_token: refreshToken });
        useAuthStore.setState({ accessToken: data.access_token, refreshToken: data.refresh_token });
        return { accessToken: data.access_token, sessionExpired: false };
    } catch (error) {
        // Only an outright rejection means the session is gone. A network blip must never
        // cost the user their session.
        return { accessToken: null, sessionExpired: (error as AxiosError)?.response?.status === 401 };
    }
}

async function renewSession(expiredAccessToken?: string): Promise<SessionRenewal> {
    const { accessToken, refreshToken } = latestTokens();
    const alreadyRenewedElsewhere = expiredAccessToken && accessToken && accessToken !== expiredAccessToken;
    if (alreadyRenewedElsewhere) return { accessToken, sessionExpired: false };
    if (!refreshToken) return { accessToken: null, sessionExpired: true };
    return exchangeRefreshToken(refreshToken);
}

// Supabase supersedes a refresh token every time one is spent, so two tabs renewing at
// once would leave the loser holding a token the server has already retired.
async function withCrossTabLock(renew: () => Promise<SessionRenewal>): Promise<SessionRenewal> {
    if (!navigator.locks?.request) return renew();
    return await navigator.locks.request(REFRESH_LOCK, renew);
}

let renewalInFlight: Promise<SessionRenewal> | null = null;

function renewSessionOnce(expiredAccessToken?: string): Promise<SessionRenewal> {
    renewalInFlight = renewalInFlight ?? withCrossTabLock(() => renewSession(expiredAccessToken));
    return renewalInFlight.finally(() => { renewalInFlight = null; });
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
        if (error.response?.status !== 401 || !request || request._retried) {
            return Promise.reject(error);
        }
        request._retried = true;

        const expiredAccessToken = (request.headers?.Authorization as string | undefined)?.replace(/^Bearer /, "");
        const { accessToken, sessionExpired } = await renewSessionOnce(expiredAccessToken);

        if (accessToken) {
            request.headers.Authorization = `Bearer ${accessToken}`;
            return api(request);
        }
        if (sessionExpired) {
            // Flipping isLoggedIn is what sends them to /sign-in, via the route guards.
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
