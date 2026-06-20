import { Link } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useSubscriptionStatus } from "@/hooks/use-subscription";

const DISMISS_KEY = "olive-subscription-banner-dismissed";

function dismissedToday(): boolean {
    return localStorage.getItem(DISMISS_KEY) === new Date().toDateString();
}

export default function SubscriptionBanner() {
    const { data: status } = useSubscriptionStatus();
    const [hidden, setHidden] = useState(true);

    const nudge = status?.nudge_level ?? "none";

    useEffect(() => {
        setHidden(nudge === "none" || dismissedToday());
    }, [nudge]);

    if (hidden || !status) return null;

    const message =
        nudge === "trial_low"
            ? `${status.consultations_remaining} free consultation${status.consultations_remaining === 1 ? "" : "s"} left — activate your membership to keep going.`
            : "Your membership has expired. Renew now to keep your founding rate.";

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, new Date().toDateString());
        setHidden(true);
    };

    return (
        <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 print:hidden">
            <p className="flex-1">{message}</p>
            <Link to="/doctor/billing" className="font-semibold underline-offset-2 hover:underline">
                View membership
            </Link>
            <button type="button" aria-label="Dismiss" onClick={dismiss} className="text-amber-500 hover:text-amber-700">
                <XIcon className="size-4" />
            </button>
        </div>
    );
}
