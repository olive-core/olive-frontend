import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// One question of the first-run setup, on its own screen. Everything a doctor is not being
// asked right now is off the page, so there is nothing to get lost in.

interface WizardFrameProps {
    stepNumber: number;
    stepCount:  number;
    title:      string;
    description: string;
    children:   ReactNode;
    footer?:    ReactNode;
    onSkip:     () => void;
}

function StepDots({ stepNumber, stepCount }: { stepNumber: number; stepCount: number }) {
    return (
        <span className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: stepCount }, (_, index) => (
                <span
                    key={index}
                    className={cn(
                        "h-1.5 rounded-full transition-all",
                        index < stepNumber ? "w-5 bg-emerald-500" : "w-1.5 bg-slate-200",
                    )}
                />
            ))}
        </span>
    );
}

export default function WizardFrame({
    stepNumber,
    stepCount,
    title,
    description,
    children,
    footer,
    onSkip,
}: WizardFrameProps) {
    return (
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-5 px-4 py-6 pb-16">
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                    <StepDots stepNumber={stepNumber} stepCount={stepCount} />
                    <span className="text-xs font-medium text-slate-400">
                        Step {stepNumber} of {stepCount}
                    </span>
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-tight text-slate-900">{title}</h1>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
            </div>

            {children}

            {footer && <div className="flex items-center gap-2">{footer}</div>}

            <button
                type="button"
                onClick={onSkip}
                className="self-center text-xs text-slate-400 underline-offset-2 hover:underline"
            >
                Skip for now
            </button>
        </div>
    );
}
