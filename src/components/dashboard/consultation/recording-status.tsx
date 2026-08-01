import { MicOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecordingStatus as Status } from "@/hooks/use-recording-session";

// One glanceable line per state — readable from across the desk while the doctor faces the patient.
const STATUS_COPY: Record<Status, { label: string; hint?: string }> = {
    starting:    { label: "Starting" },
    listening:   { label: "Listening" },
    paused:      { label: "Paused" },
    silent:      { label: "Not hearing anything", hint: "Check the mic is connected and unmuted." },
    unavailable: { label: "Microphone blocked", hint: "Allow microphone access, then try again." },
};

export function RecordingStatusDot({ status }: { status: Status }) {
    if (status === "silent" || status === "unavailable") {
        return (
            <span
                className={cn(
                    "flex size-3.5 items-center justify-center",
                    status === "unavailable" ? "text-rose-500" : "text-amber-500",
                )}
            >
                <MicOffIcon className="size-3.5" strokeWidth={2.25} />
            </span>
        );
    }

    if (status === "paused" || status === "starting") {
        return (
            <span
                aria-hidden
                className={cn("size-3 rounded-full bg-slate-300", status === "starting" && "animate-pulse")}
            />
        );
    }

    // Listening: a steady rose dot wrapped in a soft halo that breathes in sync with the card edge.
    return (
        <span aria-hidden className="relative flex size-3 items-center justify-center">
            <span className="rec-dot-pulse absolute size-3 rounded-full bg-rose-400" />
            <span className="relative size-2.5 rounded-full bg-rose-500" />
        </span>
    );
}

export default function RecordingStatus({ status }: { status: Status }) {
    const { label, hint } = STATUS_COPY[status];

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2.5">
                <RecordingStatusDot status={status} />
                <span
                    className={cn(
                        "text-sm font-medium uppercase tracking-wide",
                        status === "unavailable" ? "text-rose-600" : status === "silent" ? "text-amber-600" : "text-slate-500",
                    )}
                >
                    {label}
                </span>
            </div>
            {hint && (
                <p
                    className={cn(
                        "max-w-xs text-center text-xs font-medium",
                        status === "unavailable" ? "text-rose-700" : "text-amber-700",
                    )}
                >
                    {hint}
                </p>
            )}
        </div>
    );
}
