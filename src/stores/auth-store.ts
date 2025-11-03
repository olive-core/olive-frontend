import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStoreType {
    isLoggedIn: boolean;

    login(email: string, password: string): Promise<void>;
    logout(): void;
}

export const useAuthStore = create<AuthStoreType>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            login: async (email, password) => {
                console.log("Logging in with:", email, password);
                // TODO: Implement actual login logic here
                await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate async login
                set({ isLoggedIn: true });
            },
            logout: () => set({ isLoggedIn: false }),
        }),
        { name: "auth-store" }
    )
)