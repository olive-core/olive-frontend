import { cn } from "@/lib/utils";

interface OliveBrandMarkProps {
    isMono:    boolean;
    className?: string;
}

// Subtle "Powered by Olive" wordmark, reusing the navbar logo's pill + display type so the
// brand reads consistently. Turns near-black in monochrome mode to stay B/W-printer safe.
export default function OliveBrandMark({ isMono, className }: OliveBrandMarkProps) {
    return (
        <div className={cn("flex items-center gap-1.5 text-[11px] leading-none", className)}>
            <span className="text-slate-400">Powered by</span>
            <span className="flex items-center gap-1">
                <span className={cn("h-3 w-2 rounded-full", isMono ? "bg-slate-800" : "bg-primary")} />
                <span className={cn("font-display text-sm", isMono ? "text-slate-800" : "text-primary")}>Olive</span>
            </span>
        </div>
    );
}
