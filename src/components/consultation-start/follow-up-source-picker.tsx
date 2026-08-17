import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, StethoscopeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { withDoctorPrefix } from "@/lib/clinician";
import { cn } from "@/lib/utils";
import type { FollowUpSource } from "@/hooks/use-patient-consultations";
import ConsultationLinkMark from "./consultation-link-mark";


interface FollowUpSourcePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sources: FollowUpSource[];
    onStart: (source: FollowUpSource) => void;
    startingSessionId?: string | null;
}

function sourceSummary(source: FollowUpSource): string {
    return (
        source.chief_complaints_summary?.[0]
        || source.diagnoses_summary?.[0]
        || "Previous consultation"
    );
}

export default function FollowUpSourcePicker({
    open,
    onOpenChange,
    sources,
    onStart,
    startingSessionId,
}: FollowUpSourcePickerProps) {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (!open) setSelectedSessionId(null);
    }, [open]);

    const selected = sources.find((source) => source.session_id === selectedSessionId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90svh] flex-col overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b px-5 pb-4 pt-5 text-left">
                    <div className="mb-2 flex items-center gap-3 text-blue-700">
                        <span className="flex h-10 min-w-20 items-center justify-center rounded-full bg-blue-100 px-4">
                            <ConsultationLinkMark />
                        </span>
                        <DialogTitle>Choose the care to continue</DialogTitle>
                    </div>
                    <DialogDescription>
                        Select the last visit from the problem you are following up.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {sources.map((source) => {
                        const selectedSource = selectedSessionId === source.session_id;
                        return (
                            <button
                                type="button"
                                key={source.prescription_id}
                                onClick={() => setSelectedSessionId(source.session_id)}
                                className={cn(
                                    "relative flex w-full cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                                    selectedSource
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 bg-white hover:border-blue-300",
                                )}
                            >
                                <span className={cn(
                                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                                    selectedSource ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500",
                                )}>
                                    {selectedSource
                                        ? <CheckIcon className="size-5" strokeWidth={3} />
                                        : <StethoscopeIcon className="size-5" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold text-slate-900">
                                        {sourceSummary(source)}
                                    </span>
                                    <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                                        <CalendarIcon className="size-3.5" />
                                        {format(new Date(source.created_at), "d MMM yyyy")}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                                        {withDoctorPrefix(source.clinician_name)}
                                    </span>
                                    {source.follow_up_of_session_id && (
                                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-700">
                                            <ConsultationLinkMark className="scale-75" />
                                            Continuing series
                                        </span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="border-t bg-white p-4">
                    <Button
                        className="h-12 w-full gap-3 bg-blue-600 text-base hover:bg-blue-700"
                        disabled={!selected || !!startingSessionId}
                        isLoading={!!startingSessionId}
                        onClick={() => selected && onStart(selected)}
                    >
                        <ConsultationLinkMark />
                        Start follow-up
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
