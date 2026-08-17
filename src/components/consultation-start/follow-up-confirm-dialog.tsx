import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ConsultationLinkMark from "./consultation-link-mark";


interface FollowUpConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientName?: string | null;
    sourceDate?: string;
    sourceSummary?: string;
    onConfirm: () => void;
    isStarting?: boolean;
}

export default function FollowUpConfirmDialog({
    open,
    onOpenChange,
    patientName,
    sourceDate,
    sourceSummary,
    onConfirm,
    isStarting,
}: FollowUpConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-left">
                    <div className="mb-3 flex justify-center text-blue-700">
                        <span className="flex h-14 min-w-28 items-center justify-center rounded-full bg-blue-100 px-5">
                            <ConsultationLinkMark className="scale-125" />
                        </span>
                    </div>
                    <DialogTitle className="text-center">Continue this care?</DialogTitle>
                    <DialogDescription className="text-center">
                        The new consultation will continue from the visit below.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-center">
                    {patientName && <p className="font-semibold text-slate-900">{patientName}</p>}
                    {sourceSummary && <p className="mt-1 text-sm text-slate-700">{sourceSummary}</p>}
                    {sourceDate && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarIcon className="size-3.5" />
                            {format(new Date(sourceDate), "d MMM yyyy")}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isStarting}>
                        Back
                    </Button>
                    <Button
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={onConfirm}
                        isLoading={isStarting}
                        disabled={isStarting}
                    >
                        <ConsultationLinkMark /> Start follow-up
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
