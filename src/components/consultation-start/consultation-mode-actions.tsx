import { HistoryIcon, PlusIcon } from "lucide-react";

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
        "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
    );

    return (
        <div className={cn("grid gap-3", hasFollowUpSources && "sm:grid-cols-2")}>
            <button
                type="button"
                autoFocus={!hasFollowUpSources}
                onClick={onStartNew}
                disabled={disabled}
                className={actionClass}
            >
                <span className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <PlusIcon className="size-6" strokeWidth={2.25} />
                </span>
                <span className="font-semibold">{startingNew ? "Starting…" : "New consultation"}</span>
                <span className="text-xs text-slate-500">Start fresh</span>
            </button>

            {hasFollowUpSources && (
                <button
                    type="button"
                    onClick={onChooseFollowUp}
                    disabled={disabled}
                    className={actionClass}
                >
                    <span className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <HistoryIcon className="size-5.5" strokeWidth={2.25} />
                    </span>
                    <span className="font-semibold">Follow-up</span>
                    <span className="text-xs text-slate-500">Continue previous care</span>
                </button>
            )}
        </div>
    );
}
