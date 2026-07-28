import { useSubscriptionStatus } from "@/hooks/use-subscription";
import type { DashboardNotice } from "./notice";

// Grace nudging lives in the navbar pill and a start-consultation prompt, so the notice
// slot only covers the low-trial case.
export function useSubscriptionNotice(): DashboardNotice | null {
    const { data: status } = useSubscriptionStatus();

    if (!status || status.nudge_level !== "trial_low") return null;

    const remaining = status.consultations_remaining;

    return {
        id:      "subscription-trial-low",
        tone:    "warning",
        message: `${remaining} free consultation${remaining === 1 ? "" : "s"} left — activate your membership to keep going.`,
        action:  { label: "View membership", to: "/doctor/billing" },
    };
}
