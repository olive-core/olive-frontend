import { ArrowLeftIcon, CheckCircle2Icon, ClockIcon, CrownIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSubscriptionStatus } from "@/hooks/use-subscription";
import { formatTaka, formatUntilDate } from "@/lib/subscription";

import PaidClaimForm from "./paid-claim-form";
import PaymentInstructions from "./payment-instructions";

type Step = "overview" | "instructions" | "claim" | "done";

function StatusSummary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/70">{label}</p>
            <p className="mt-1 text-lg font-semibold text-emerald-800">{value}</p>
        </div>
    );
}

export default function MembershipPanel() {
    const { data: status, isLoading, isError, refetch } = useSubscriptionStatus();

    const [step, setStep] = useState<Step>("overview");
    const [months, setMonths] = useState(1);

    const goBack = () => setStep(step === "claim" ? "instructions" : "overview");

    if (isError) return <div role="alert" className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">Your membership couldn’t load.<Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>Try again</Button></div>;

    if (isLoading || !status) {
        return <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />;
    }

    const price = status.price ?? 0;
    const amount = price * months;
    const pending = status.pending_payment;

    const summaryValue =
        status.state === "active"
            ? `Active until ${formatUntilDate(status.subscription_until)}`
            : status.state === "trial"
                ? `${status.consultations_remaining} of ${status.trial_limit} free consultations left`
                : status.state === "grace"
                    ? `Expired — renew to keep your founding rate`
                    : status.subscription_until
                        ? `Membership expired. Renew to continue`
                        : `Trial ended. Activate to continue.`;

    return (
        <div className="mx-auto w-full max-w-xl space-y-6">
            <div className="flex items-center gap-2 text-emerald-700">
                <CrownIcon className="size-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Founding Member</span>
            </div>

            <StatusSummary label="Your membership" value={summaryValue} />

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {!pending && (step === "instructions" || step === "claim") && (
                    <button
                        type="button"
                        onClick={goBack}
                        className="mb-4 inline-flex min-h-11 cursor-pointer items-center gap-1 text-sm text-slate-500 transition hover:text-slate-700"
                    >
                        <ArrowLeftIcon className="size-4" /> Back
                    </button>
                )}

                {pending && (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <ClockIcon className="size-12 text-emerald-500" />
                        <h3 className="text-lg font-semibold text-slate-800">Payment under review</h3>
                        <p className="max-w-sm text-sm text-slate-500">
                            We&apos;ve received your payment of {formatTaka(pending.amount)} for {pending.months} month{pending.months === 1 ? "" : "s"}, submitted on {formatUntilDate(pending.created_at)}. You&apos;ll get a confirmation SMS once it&apos;s activated.
                        </p>
                    </div>
                )}

                {!pending && step === "overview" && (
                    <div className="space-y-5">
                        <div>
                            <p className="text-3xl font-bold text-slate-900">
                                {formatTaka(price)}
                                <span className="text-base font-medium text-slate-400"> / month</span>
                            </p>
                            <p className="mt-1 text-sm text-slate-500">Pay ahead and stay covered. Your discount rate is locked.</p>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-600">Choose duration</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {status.prepay_months.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setMonths(option)}
                                        aria-pressed={months === option}
                                        className={`cursor-pointer rounded-xl border-2 py-3 text-center transition ${
                                            months === option
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                    >
                                        <span className="block text-lg font-semibold">{option}</span>
                                        <span className="text-xs">{option === 1 ? "month" : "months"}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <span className="text-sm text-slate-500">Total</span>
                            <span className="text-xl font-bold text-slate-900">{formatTaka(amount)}</span>
                        </div>

                        <Button className="min-h-11 w-full" size="lg" onClick={() => setStep("instructions")}>
                            Continue to payment
                        </Button>
                    </div>
                )}

                {!pending && step === "instructions" && (
                    <PaymentInstructions
                        bkashNumber={status.bkash_number}
                        amount={amount}
                        onPaid={() => setStep("claim")}
                    />
                )}

                {!pending && step === "claim" && (
                    <PaidClaimForm amount={amount} months={months} onSubmitted={() => setStep("done")} />
                )}

                {!pending && step === "done" && (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <CheckCircle2Icon className="size-12 text-emerald-500" />
                        <h3 className="text-lg font-semibold text-slate-800">We&apos;re reviewing your payment</h3>
                        <p className="max-w-sm text-sm text-slate-500">
                            You&apos;ll get a confirmation SMS as soon as your membership is activated. This usually takes a short while.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
