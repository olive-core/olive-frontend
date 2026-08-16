import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface SectionItemProps {
    name:        string;
    duration?:   string | null;
    notes?:      string | null;
    icdCode?:    string | null;
    confidence?: number | null;
    reasoning?:  string | null;
    priority?:   string | null;
}

interface PriorityStyle {
    label:  string;
    badge:  string;
    border: string;
}

function getPriorityStyle(priority?: string | null): PriorityStyle | null {
    switch (priority?.toLowerCase()) {
        case "urgent":
            return { label: "Urgent",  badge: "bg-rose-50 text-rose-600",       border: "border-rose-400" };
        case "routine":
            return { label: "Routine", badge: "bg-amber-50 text-amber-600",     border: "border-amber-400" };
        case "low":
            return { label: "Low",     badge: "bg-emerald-50 text-emerald-600", border: "border-emerald-400" };
        default:
            return null;
    }
}

function getConfidenceColor(confidence: number): string {
    if (confidence >= 85) return "bg-emerald-500";
    if (confidence >= 60) return "bg-amber-400";
    return "bg-rose-500";
}

function ConfidenceBar({ confidence }: { confidence: number }) {
    const clamped = Math.min(Math.max(confidence, 0), 100);
    return (
        <div className="flex items-center gap-1.5" title={`Confidence: ${confidence}%`}>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(confidence)}`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
            <span className="text-[10px] font-bold text-slate-800">{confidence}%</span>
        </div>
    );
}

const REASONING_BODY = "max-w-[250px] bg-slate-800 text-white p-2 rounded shadow-lg text-[12px] leading-relaxed";

function ReasoningBody({ text }: { text: string }) {
    return (
        <p>
            <span className="text-emerald-400 font-semibold mr-1">Reasoning:</span>
            {text}
        </p>
    );
}

function ReasoningTrigger({ touch }: { touch?: boolean }) {
    return (
        <button
            type="button"
            aria-label="Why this was suggested"
            className={`text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center ${touch ? "size-9 cursor-pointer" : "cursor-help"}`}
        >
            <InfoIcon className="h-3.5 w-3.5" />
        </button>
    );
}

// A touch screen has no hover, and Radix tooltips deliberately never open from a tap — so
// on a phone the AI's reasoning was written but unreadable. There it becomes a tap-to-open
// popover instead; a mouse keeps the hover tooltip.
function ReasoningTooltip({ text }: { text: string }) {
    const isTouch = useMediaQuery("(pointer: coarse)");

    if (isTouch) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <ReasoningTrigger touch />
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className={`${REASONING_BODY} w-auto border-0`}>
                    <ReasoningBody text={text} />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <ReasoningTrigger />
                </TooltipTrigger>
                <TooltipContent side="top" className={REASONING_BODY}>
                    <ReasoningBody text={text} />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default function SectionItem({
    name,
    duration,
    notes,
    icdCode,
    confidence,
    reasoning,
    priority,
}: SectionItemProps) {
    const priorityStyle = getPriorityStyle(priority);
    const hasMeta = Boolean(icdCode || confidence || reasoning || priorityStyle);

    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
                <span className="text-slate-800 text-[14px] leading-tight">
                    {name || <span className="text-slate-300 italic">Untitled</span>}
                </span>
                {duration && (
                    <span className="text-[11px] text-emerald-600 uppercase tracking-tight">
                        — {duration}
                    </span>
                )}
            </div>

            {notes && (
                <p className="text-[12px] text-slate-800 font-medium leading-relaxed italic">
                    {notes}
                </p>
            )}

            {hasMeta && (
                <div className="flex flex-col gap-1.5 mt-1.5 border-l-2 border-emerald-400 pl-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {icdCode && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {icdCode}
                            </span>
                        )}

                        {typeof confidence === "number" && <ConfidenceBar confidence={confidence} />}

                        {priorityStyle && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priorityStyle.badge}`}>
                                {priorityStyle.label}
                            </span>
                        )}

                        {reasoning && <ReasoningTooltip text={reasoning} />}
                    </div>
                </div>
            )}
        </div>
    );
}
