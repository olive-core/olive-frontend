import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PrintPaperMode } from "@/lib/print-paper";

// The first question of a chamber's pad, and the one that decides whether any of the rest
// matters: does the paper going into the printer already carry the doctor's letterhead?
// It is asked with pictures because the two answers look nothing alike on paper.

function PaperSheet({ children }: { children: React.ReactNode }) {
    return (
        <span className="flex h-20 w-full flex-col gap-1 rounded-md border bg-white p-2 shadow-xs">{children}</span>
    );
}

function OliveLetterheadThumb() {
    return (
        <PaperSheet>
            <span className="flex items-center gap-1.5">
                <span className="size-4 shrink-0 rounded-full bg-emerald-100" />
                <span className="flex flex-1 flex-col gap-0.5">
                    <span className="h-1 w-3/5 rounded bg-slate-300" />
                    <span className="h-1 w-2/5 rounded bg-slate-200" />
                </span>
            </span>
            <span className="h-0.5 w-full rounded bg-emerald-400" />
            <span className="flex flex-1 flex-col justify-center gap-1">
                <span className="h-1 w-4/5 rounded bg-slate-100" />
                <span className="h-1 w-3/5 rounded bg-slate-100" />
            </span>
        </PaperSheet>
    );
}

function PrePrintedThumb() {
    return (
        <PaperSheet>
            <span className="h-4 w-full shrink-0 rounded-sm bg-slate-200" />
            <span className="flex flex-1 flex-col justify-center gap-1 rounded-sm border border-dashed border-emerald-300 px-1.5">
                <span className="h-1 w-4/5 rounded bg-slate-100" />
                <span className="h-1 w-3/5 rounded bg-slate-100" />
            </span>
            <span className="h-2 w-full shrink-0 rounded-sm bg-slate-200" />
        </PaperSheet>
    );
}

interface PaperModeOption {
    value:       PrintPaperMode;
    label:       string;
    description: string;
    Thumb:       () => React.ReactElement;
}

const PAPER_MODE_OPTIONS: PaperModeOption[] = [
    {
        value:       "digital",
        label:       "Blank paper",
        description: "Olive prints your name, degree and chamber details at the top.",
        Thumb:       OliveLetterheadThumb,
    },
    {
        value:       "preprinted",
        label:       "My own printed pad",
        description: "Your pad already has the header printed. Olive prints only inside the blank space.",
        Thumb:       PrePrintedThumb,
    },
];

export default function PaperModeChoice({ value, onChange }: {
    value:    PrintPaperMode;
    onChange: (mode: PrintPaperMode) => void;
}) {
    return (
        <div role="radiogroup" aria-label="What paper do you print on?" className="grid gap-2 sm:grid-cols-2">
            {PAPER_MODE_OPTIONS.map(({ value: mode, label, description, Thumb }) => {
                const isSelected = value === mode;
                return (
                    <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onChange(mode)}
                        className={cn(
                            "relative flex flex-col gap-2.5 rounded-xl border p-3 text-left transition-colors",
                            isSelected
                                ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30"
                                : "border-slate-200 bg-white hover:border-slate-300",
                        )}
                    >
                        {isSelected && (
                            <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <CheckIcon className="size-3" />
                            </span>
                        )}
                        <Thumb />
                        <span className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-slate-800">{label}</span>
                            <span className="text-xs leading-snug text-slate-500">{description}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
