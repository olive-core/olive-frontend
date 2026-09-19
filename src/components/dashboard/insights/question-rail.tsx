import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { QUESTIONS, type QuestionKey } from "./questions";

interface QuestionRailProps {
    value:    QuestionKey;
    onChange: (question: QuestionKey) => void;
}

/** One question at a time. Scrolls sideways on a phone rather than wrapping into a
 *  block of buttons that buries the answer below the fold. */
export default function QuestionRail({ value, onChange }: QuestionRailProps) {
    const selected = useRef<HTMLButtonElement>(null);

    // A drill-down changes the question from elsewhere on the page; without this the
    // newly selected pill can sit off-screen on a phone.
    useEffect(() => {
        selected.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }, [value]);

    return (
        <div
            role="tablist"
            aria-label="Question"
            className="-mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:px-0 sm:[mask-image:none]"
        >
            {QUESTIONS.map((question) => (
                <button
                    key={question.key}
                    ref={value === question.key ? selected : undefined}
                    type="button"
                    role="tab"
                    aria-selected={value === question.key}
                    onClick={() => onChange(question.key)}
                    className={cn(
                        "shrink-0 snap-start scroll-mt-24 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                        value === question.key
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300",
                    )}
                >
                    {question.label}
                </button>
            ))}
        </div>
    );
}
