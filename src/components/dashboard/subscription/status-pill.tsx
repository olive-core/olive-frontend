import { useSubscriptionStatus } from "@/hooks/use-subscription";
import { formatUntilDate } from "@/lib/subscription";

export default function SubscriptionStatusPill() {
    const { data: status } = useSubscriptionStatus();
    if (!status) return null;

    const { label, tone } =
        status.state !== "active" && status.pending_payment
            ? { label: "Payment under review", tone: "bg-sky-50 text-sky-700" }
            : status.state === "grace"
                ? { label: `Grace · ${status.grace_consultations_remaining ?? 0} left`, tone: "bg-amber-50 text-amber-700" }
                : describe(status.state, status.consultations_remaining, status.subscription_until);

    return (
        <span
            className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}
        >
            {label}
        </span>
    );
}

function describe(state: string, remaining: number | null, until: string | null) {
    if (state === "active") {
        return { label: `Active · until ${formatUntilDate(until)}`, tone: "bg-emerald-50 text-emerald-700" };
    }
    if (state === "trial") {
        return { label: `Trial · ${remaining ?? 0} left`, tone: "bg-slate-100 text-slate-600" };
    }
    const label = until ? "Membership expired" : "Trial ended";
    return { label, tone: "bg-amber-50 text-amber-700" };
}
