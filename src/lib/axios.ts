import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";
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