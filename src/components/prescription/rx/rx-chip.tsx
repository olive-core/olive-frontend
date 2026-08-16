import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RxChipTone = "solid" | "soft" | "muted";

interface RxChipProps {
    label:      ReactNode;
    onClick:    () => void;
    active?:    boolean;
    tone?:      RxChipTone;
    title?:     string;
    className?: string;
}

// A full 44px target on a phone — these quick-picks are how a prescription is actually
// written there — collapsing back to the compact desktop chip from `sm` up.
const CHIP_SIZE = "min-h-11 px-3 py-2 text-sm sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-xs";

const TONE_STYLES: Record<RxChipTone, { active: string; idle: string }> = {
    solid: {
        active: "bg-emerald-600 border-emerald-600 text-white font-semibold",
        idle:   "border-slate-200 text-slate-500 hover:bg-slate-50",
    },
    soft: {
        active: "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold",
        idle:   "border-slate-200 text-slate-500 hover:bg-slate-50",
    },
    muted: {
        active: "bg-slate-200 border-slate-300 text-slate-600 font-semibold",
        idle:   "border-slate-200 text-slate-400 hover:bg-slate-50",
    },
};

// The one quick-pick control of the medicine editor: frequency codes, dose amounts,
// duration units and presets, meal timing, instruction phrases.
export default function RxChip({ label, onClick, active, tone = "solid", title, className }: RxChipProps) {
    const styles = TONE_STYLES[tone];

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-pressed={active}
            className={cn(
                "inline-flex cursor-pointer select-none items-center justify-center rounded-md border transition-colors",
                CHIP_SIZE,
                active ? styles.active : styles.idle,
                className,
            )}
        >
            {label}
        </button>
    );
}
