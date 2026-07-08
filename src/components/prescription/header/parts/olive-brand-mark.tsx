import { cn } from "@/lib/utils";

interface OliveBrandMarkProps {
    isMono:     boolean;
    className?: string;
}

// "Powered by Olive" as a pure-text lockup (the logo image isn't final, so no logo here):
// a quiet small-caps lead-in with the wordmark in a serif italic — deliberately a
// different face from the prescription's sans so the branding is noticeable without
// competing with clinical content. Near-black in monochrome mode to stay B/W-printer safe.
export default function OliveBrandMark({ isMono, className }: OliveBrandMarkProps) {
    return (
        <div className={cn("flex items-baseline gap-1.5 whitespace-nowrap", className)}>
            <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Powered by
            </span>
            <span
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                className={cn(
                    "text-[15px] font-bold italic leading-none",
                    isMono ? "text-slate-900" : "text-emerald-600",
                )}
            >
                Olive
            </span>
        </div>
    );
}
