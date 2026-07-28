import { CLEAR_RMS } from "@/lib/mic-check";
import { cn } from "@/lib/utils";

// Loudness as a proportion of a healthy speaking level, so a full-looking bar means
// "loud enough for Olive" rather than an abstract 0–1 reading.
export default function MicLevelBar({ level }: { level: number }) {
    const filled = Math.min(100, Math.round((level / CLEAR_RMS) * 100));

    return (
        <div className="flex flex-col gap-1.5">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-100",
                        filled >= 100 ? "bg-emerald-500" : filled > 20 ? "bg-emerald-400" : "bg-amber-400",
                    )}
                    style={{ width: `${filled}%` }}
                />
            </div>
            <p className="text-xs text-slate-700">Speak normally — the bar should reach the end.</p>
        </div>
    );
}
