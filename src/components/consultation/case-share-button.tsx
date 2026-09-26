import { useQuery } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import CaseCodeButton from "@/components/case/case-code-button";
import { formatCaseCode } from "@/lib/case-code";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type CaseShareLink = {
    code: string;
    url: string;
};

interface CaseShareDialogProps {
    prescriptionId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CaseShareDialog({
    prescriptionId,
    open,
    onOpenChange,
}: CaseShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const {
        data: link,
        isPending,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["case-share-link", prescriptionId],
        queryFn: () => api.post<CaseShareLink>(`/case/share/${prescriptionId}`).then((response) => response.data),
        enabled: open,
        retry: false,
        staleTime: Infinity,
    });

    const copyLink = async () => {
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy the link");
        }
    };

    const nativeShare = async () => {
        if (!link || !navigator.share) return;
        try {
            await navigator.share({ title: "Olive Case", text: `Olive case: ${formatCaseCode(link.code)}`, url: link.url });
        } catch (error) {
            if ((error as { name?: string }).name !== "AbortError") {
                toast.error("Could not open sharing options");
            }
        }
    };

    const whatsappUrl = link
        ? `https://wa.me/?text=${encodeURIComponent(`Olive case: ${formatCaseCode(link.code)}\n${link.url}`)}`
        : "#";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share this Case</DialogTitle>
                    <DialogDescription>
                        Doctors who open this link can view the whole Case and start follow-ups.
                        Each doctor can edit only their own consultation; after saving, only their clinical notes can change.
                    </DialogDescription>
                </DialogHeader>

                {isPending && !link ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                        Creating link…
                    </div>
                ) : link ? (
                    <>
                        <div className="flex flex-col items-center gap-2 py-2">
                            <span className="text-xs font-medium text-slate-500">Tap to copy the case code</span>
                            <CaseCodeButton code={link.code} className="min-h-14 px-5" />
                        </div>
                        <div className="break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                            {link.url}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                                <Button type="button" onClick={nativeShare} className="min-h-11 flex-1 bg-emerald-600 hover:bg-emerald-700">
                                    <Share2Icon className="size-4" /> Share
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={copyLink} className="min-h-11 flex-1">
                                {copied ? <CheckIcon className="size-4 text-emerald-600" /> : <CopyIcon className="size-4" />}
                                {copied ? "Link copied" : "Copy link"}
                            </Button>
                            <Button asChild variant="outline" className="min-h-11 flex-1">
                                <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
                            </Button>
                        </div>
                    </>
                ) : isError ? (
                    <Button type="button" onClick={() => refetch()}>
                        Try again
                    </Button>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
