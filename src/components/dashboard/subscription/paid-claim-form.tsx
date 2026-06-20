import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitPaymentClaim } from "@/hooks/use-subscription";
import type { PaymentClaim } from "@/types/subscription";

interface PaidClaimFormProps {
    amount: number;
    months: number;
    onSubmitted: () => void;
}

export default function PaidClaimForm({ amount, months, onSubmitted }: PaidClaimFormProps) {
    const [txnRef, setTxnRef] = useState("");
    const [senderMsisdn, setSenderMsisdn] = useState("");
    const { mutateAsync, isPending } = useSubmitPaymentClaim();

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();

        const claim: PaymentClaim = {
            amount,
            months,
            method: "bkash",
            txn_ref: txnRef.trim(),
            sender_msisdn: senderMsisdn.trim(),
        };

        try {
            await mutateAsync(claim);
            onSubmitted();
        } catch {
            toast.error("Could not submit your payment. Please try again.");
        }
    };

    return (
        <form className="space-y-4" onSubmit={submit}>
            <div>
                <h3 className="font-semibold text-slate-800">Confirm your payment</h3>
                <p className="text-sm text-slate-500">Enter the details from your bKash confirmation.</p>
            </div>

            <div className="space-y-3">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Transaction ID</label>
                    <Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} placeholder="e.g. 8N7A6B5C4D" required />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Sender number</label>
                    <Input value={senderMsisdn} onChange={(e) => setSenderMsisdn(e.target.value)} placeholder="01XXXXXXXXX" required />
                </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? "Submitting…" : "Submit for review"}
            </Button>
        </form>
    );
}
