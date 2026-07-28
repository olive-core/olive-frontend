import { usePassiveMicCheck } from "@/hooks/use-passive-mic-check";
import { MIC_VERDICT_COPY } from "@/lib/mic-check";
import type { DashboardNotice } from "./notice";

// A working mic is never announced — only a problem earns the slot.
export function useMicNotice(): DashboardNotice | null {
    const { verdict } = usePassiveMicCheck();

    if (!verdict || verdict === "clear") return null;

    return {
        id:      "mic-check",
        tone:    verdict === "muted" ? "danger" : "warning",
        message: `${MIC_VERDICT_COPY[verdict].title}. ${MIC_VERDICT_COPY[verdict].detail}`,
        action:  { label: "Fix", to: "/doctor/device-check" },
    };
}
