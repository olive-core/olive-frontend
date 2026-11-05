import { AxiosError } from "axios";

import type { SubscriptionStatus } from "@/types/subscription";

// Free consultations before a membership is needed, for pages shown before sign-in (the
// signed-in app reads trial_limit from the server). Must match the backend's
// TRIAL_CONSULTATION_LIMIT; change both together.
export const FREE_TRIAL_CONSULTATIONS = 15;

export function isSubscriptionBlocked(error: unknown): boolean {
    return error instanceof AxiosError && error.response?.status === 402;
}

export function getSubscriptionStatusFromError(error: unknown): SubscriptionStatus | null {
    if (error instanceof AxiosError && error.response?.status === 402) {
        return (error.response.data?.detail as SubscriptionStatus) ?? null;
    }
    return null;
}

export function formatTaka(amount: number): string {
    return `৳${amount.toLocaleString("en-BD")}`;
}

export function formatUntilDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
