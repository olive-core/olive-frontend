import { MicOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecorderStatus = "listening" | "paused" | "silent";

// One glanceable line per state — readable from across the desk while the doctor faces the patient.
const STATUS_COPY: Record<RecorderStatus, { label: string; hint?: string }> = {
    listening: { label: "Listening" },
    paused: { label: "Paused" },
    silent: { label: "Not hearing anything", hint: "Check the mic is connected and unmuted." },
};

function StatusIndicator({ status }: { status: RecorderStatus }) {
    if (status === "silent") {
        return (
            <span className="flex size-3.5 items-center justify-center text-amber-500">
                <MicOffIcon className="size-3.5" strokeWidth={2.25} />
            </span>
        );
    }

    if (status === "paused") {
        return <span aria-hidden className="size-3 rounded-full bg-slate-300" />;
    }

    // Listening: a steady rose dot wrapped in a soft halo that breathes in sync with the card edge.
    return (
        <span aria-hidden className="relative flex size-3 items-center justify-center">
            <span className="rec-dot-pulse absolute size-3 rounded-full bg-rose-400" />
            <span className="relative size-2.5 rounded-full bg-rose-500" />
        </span>
    );
}

export default function RecordingStatus({ status }: { status: RecorderStatus }) {
    const { label, hint } = STATUS_COPY[status];

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2.5">
                <StatusIndicator status={status} />
                <span
                    className={cn(
                        "text-sm font-medium uppercase tracking-wide",
                        status === "silent" ? "text-amber-600" : "text-slate-500",
                    )}
                >
                    {label}
                </span>
            </div>
            {hint && <p className="max-w-xs text-center text-xs font-medium text-amber-700">{hint}</p>}
        </div>
    );
}
