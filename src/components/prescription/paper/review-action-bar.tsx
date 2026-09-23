import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ReviewActionBarProps {
    /** The fact beside the buttons, desktop only. The buttons carry the action. */
    hint:       string;
    children:   ReactNode;
    className?: string;
}

// The sticky bar under a session document the doctor is reviewing (Save & Print). Both the
// prescription and the clinical notes carry one, so the doctor can finish from either tab.
// Never printed.
export default function ReviewActionBar({ hint, children, className }: ReviewActionBarProps) {
    return (
        <div
            className={cn(
                "sticky bottom-0 z-20 flex items-center justify-end gap-4 bg-white/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:justify-between print:hidden",
                className,
            )}
        >
            <span className="hidden text-xs text-slate-400 sm:block">{hint}</span>
            <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">{children}</div>
        </div>
    );
}
