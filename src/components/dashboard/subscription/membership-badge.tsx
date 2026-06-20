import { Link } from "@tanstack/react-router";
import { CrownIcon } from "lucide-react";

import { useSubscriptionStatus } from "@/hooks/use-subscription";
import { formatUntilDate } from "@/lib/subscription";

export default function MembershipBadge() {
    const { data: status } = useSubscriptionStatus();
    if (!status) return null;

    const detail =
        status.state === "active"
            ? `Active until ${formatUntilDate(status.subscription_until)}`
            : status.state === "trial"
                ? `Trial · ${status.consultations_remaining} of ${status.trial_limit} left`
                : status.subscription_until
                    ? "Membership expired"
                    : "Trial ended";

    return (
        <Link
            to="/doctor/billing"
            className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 transition hover:bg-emerald-50"
        >
            <div className="flex items-center gap-3">
                <CrownIcon className="size-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Founding Member</span>
            </div>
            <span className="text-sm font-medium text-emerald-700">{detail}</span>
        </Link>
    );
}
