import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import GraceWarningDialog from "@/components/dashboard/subscription/grace-warning-dialog";
import { useSubscriptionStatus } from "@/hooks/use-subscription";

const GRACE_WARNING_THRESHOLD = 3;

/**
 * Warns a clinician on the last few consultations of their grace period before
 * letting them start a new one. Non-blocking: they can always continue.
 */
export function useGraceGuard() {
    const { data: status } = useSubscriptionStatus();
    const navigate = useNavigate();
    const [pendingStart, setPendingStart] = useState<(() => void) | null>(null);

    const remaining = status?.grace_consultations_remaining ?? null;
    const shouldWarn = status?.state === "grace" && remaining !== null && remaining <= GRACE_WARNING_THRESHOLD;

    const guardStart = (proceed: () => void) => {
        if (shouldWarn) {
            setPendingStart(() => proceed);
        } else {
            proceed();
        }
    };

    const dialog = (
        <GraceWarningDialog
            open={pendingStart !== null}
            remaining={remaining ?? 0}
            onContinue={() => {
                const proceed = pendingStart;
                setPendingStart(null);
                proceed?.();
            }}
            onRenew={() => {
                setPendingStart(null);
                navigate({ to: "/doctor/billing" });
            }}
            onOpenChange={(open) => !open && setPendingStart(null)}
        />
    );

    return { guardStart, dialog };
}
