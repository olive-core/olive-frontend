import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, HistoryIcon, StethoscopeIcon } from "lucide-react";

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


interface FollowUpSourcePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sources: FollowUpSource[];
    onStart: (source: FollowUpSource) => void;
    startingSessionId?: string | null;
}

function sourceSummary(source: FollowUpSource): string {
    return (
        source.diagnoses_summary?.[0]
        || source.chief_complaints_summary?.[0]
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
                    <div className="mb-2 flex items-center gap-3 text-emerald-700">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <HistoryIcon className="size-5" />
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
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-slate-200 bg-white hover:border-emerald-300",
                                )}
                            >
                                <span className={cn(
                                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                                    selectedSource ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500",
                                )}>
                                    {selectedSource
                                        ? <CheckIcon className="size-5" strokeWidth={3} />
                                        : <StethoscopeIcon className="size-5" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold text-slate-900">
                                        {sourceSummary(source)}
                                    </span>
                                    {source.diagnoses_summary?.[0] && source.chief_complaints_summary?.[0] && (
                                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                                            {source.chief_complaints_summary[0]}
                                        </span>
                                    )}
                                    <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                                        <CalendarIcon className="size-3.5" />
                                        {format(new Date(source.created_at), "d MMM yyyy")}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                                        {withDoctorPrefix(source.clinician_name)}
                                    </span>
                                    {source.follow_up_of_session_id && (
                                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
                                            <HistoryIcon className="size-3" />
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
                        className="h-12 w-full gap-3 text-base"
                        disabled={!selected || !!startingSessionId}
                        isLoading={!!startingSessionId}
                        onClick={() => selected && onStart(selected)}
                    >
                        <HistoryIcon className="size-5" />
                        Start follow-up
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
