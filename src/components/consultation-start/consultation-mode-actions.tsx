import { CirclePlusIcon } from "lucide-react";

import ConsultationLinkMark from "./consultation-link-mark";
import { cn } from "@/lib/utils";


interface ConsultationModeActionsProps {
    onStartNew: () => void;
    onChooseFollowUp: () => void;
    hasFollowUpSources: boolean;
    startingNew?: boolean;
    disabled?: boolean;
}

export default function ConsultationModeActions({
    onStartNew,
    onChooseFollowUp,
    hasFollowUpSources,
    startingNew = false,
    disabled = false,
}: ConsultationModeActionsProps) {
    const actionClass = cn(
        "group flex min-h-32 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
    );

    return (
        <div className={cn("grid gap-3", hasFollowUpSources && "sm:grid-cols-2")}>
            <button
                type="button"
                autoFocus={!hasFollowUpSources}
                onClick={onStartNew}
                disabled={disabled}
                className={cn(
                    actionClass,
                    "border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50",
                )}
            >
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <CirclePlusIcon className="size-7" strokeWidth={2.5} />
                </span>
                <span className="font-semibold">{startingNew ? "Starting…" : "New consultation"}</span>
                <span className="text-xs text-emerald-700/80">Start fresh</span>
            </button>

            {hasFollowUpSources && (
                <button
                    type="button"
                    onClick={onChooseFollowUp}
                    disabled={disabled}
                    className={cn(
                        actionClass,
                        "border-blue-200 bg-blue-50/60 text-blue-800 hover:border-blue-400 hover:bg-blue-50",
                    )}
                >
                    <span className="flex h-12 min-w-20 items-center justify-center rounded-full bg-blue-600 px-4 text-white shadow-sm">
                        <ConsultationLinkMark className="scale-110" />
                    </span>
                    <span className="font-semibold">Follow-up</span>
                    <span className="text-xs text-blue-700/80">Continue previous care</span>
                </button>
            )}
        </div>
    );
}
