import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/subscription";

interface PaymentInstructionsProps {
    bkashNumber: string;
    amount: number;
    reference: string;
    onPaid: () => void;
}

function CopyableRow({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="font-semibold text-slate-800">{value}</p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label={`Copy ${label}`} onClick={copy}>
                {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
            </Button>
        </div>
    );
}

export default function PaymentInstructions({ bkashNumber, amount, reference, onPaid }: PaymentInstructionsProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-slate-800">Send payment via bKash</h3>
                <p className="text-sm text-slate-500">
                    Send <span className="font-semibold text-slate-700">Send Money</span> to the number below, then confirm.
                </p>
            </div>

            <div className="space-y-2">
                <CopyableRow label="bKash number" value={bkashNumber} />
                <CopyableRow label="Amount" value={formatTaka(amount)} />
                <CopyableRow label="Reference" value={reference} />
            </div>

            <p className="text-xs text-slate-400">
                Add your phone number as the reference so we can match your payment quickly.
            </p>

            <Button className="w-full" size="lg" onClick={onPaid}>
                I&apos;ve paid
            </Button>
        </div>
    );
}
