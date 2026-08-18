import { useQuery } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

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
            await navigator.share({ title: "Olive Case", text: "A doctor shared a Case with you in Olive.", url: link.url });
        } catch (error) {
            if ((error as { name?: string }).name !== "AbortError") {
                toast.error("Could not open sharing options");
            }
        }
    };

    const whatsappUrl = link
        ? `https://wa.me/?text=${encodeURIComponent(`A doctor shared a Case with you in Olive.\n${link.url}`)}`
        : "#";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share this Case</DialogTitle>
                    <DialogDescription>
                        Any doctor signed in to Olive can open this Case and its future follow-ups.
                    </DialogDescription>
                </DialogHeader>

                {isPending && !link ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                        Creating link…
                    </div>
                ) : link ? (
                    <>
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
                                {copied ? "Copied" : "Copy link"}
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
