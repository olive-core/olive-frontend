import { format } from "date-fns";
import { EyeIcon, HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PatientPrescriptionListItem } from "@/types/patient";


interface ConsultationModeBannerProps {
    followUpSource?: PatientPrescriptionListItem;
    isFollowUp: boolean;
    onViewSource?: () => void;
}

export default function ConsultationModeBanner({
    followUpSource,
    isFollowUp,
    onViewSource,
}: ConsultationModeBannerProps) {
    if (!isFollowUp) {
        return (
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
                <span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
                New consultation
            </div>
        );
    }

    const summary = (
        followUpSource?.diagnoses_summary?.[0]
        || followUpSource?.chief_complaints_summary?.[0]
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-brand-800">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <HistoryIcon className="size-5" />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold">Follow-up consultation</p>
                    {followUpSource && (
                        <p className="truncate text-xs text-brand-700">
                            Continuing {format(new Date(followUpSource.created_at), "d MMM yyyy")}
                            {summary ? ` · ${summary}` : ""}
                        </p>
                    )}
                </div>
            </div>
            {followUpSource && onViewSource && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full gap-1.5 text-brand-700 hover:bg-brand-100 hover:text-brand-900 sm:w-auto"
                    onClick={onViewSource}
                >
                    <EyeIcon className="size-4" /> View previous
                </Button>
            )}
        </div>
    );
}
