import { format } from "date-fns";
import { CirclePlusIcon, EyeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PatientPrescriptionListItem } from "@/types/patient";
import ConsultationLinkMark from "./consultation-link-mark";


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
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                <CirclePlusIcon className="size-4" /> New consultation
            </div>
        );
    }

    const summary = (
        followUpSource?.chief_complaints_summary?.[0]
        || followUpSource?.diagnoses_summary?.[0]
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-blue-800">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 min-w-16 items-center justify-center rounded-full bg-blue-600 px-3 text-white">
                    <ConsultationLinkMark className="scale-90" />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold">Follow-up consultation</p>
                    {followUpSource && (
                        <p className="truncate text-xs text-blue-700">
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
                    className="gap-1.5 text-blue-700 hover:bg-blue-100 hover:text-blue-900"
                    onClick={onViewSource}
                >
                    <EyeIcon className="size-4" /> View previous
                </Button>
            )}
        </div>
    );
}
