import { ArrowUpRightIcon } from "lucide-react";

import { useRecordingSession } from "@/hooks/use-recording-session";
import { useRecordingSessionActions } from "@/hooks/use-recording-session-actions";
import { cn, formatDuration } from "@/lib/utils";
import RecordingStatus from "./recording-status";
import RecorderControls from "./recorder-controls";
import FailedChunkNotice from "./failed-chunk-notice";
import DiscardSessionDialog from "./discard-session-dialog";

// The recording follows the doctor. Once the consultation screen is no longer on screen,
// the running recorder reappears here — same session, same controls — so looking up a
// past prescription or a chamber setting mid-consultation never costs the conversation.
//
// It shows for EVERY state of a live session, including a microphone that is still
// opening or was blocked. A doctor who has navigated away must never be left with a
// session running somewhere and no way to reach it.
export default function FloatingRecorder() {
    const { target, status, duration, failedChunkCount, hasInlineRecorder } = useRecordingSession();
    const { discardSession, openConsultation } = useRecordingSessionActions();

    if (!target || hasInlineRecorder) return null;

    return (
        <div
            role="region"
            aria-label="Recording in progress"
            className={cn(
                "fixed right-4 bottom-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border bg-white p-3 shadow-lg print:hidden",
                status === "listening" && "rec-card-glow",
            )}
            style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
            <div className="flex items-center justify-between gap-3">
                <RecordingStatus status={status} />
                <span
                    className={cn(
                        "text-xl font-light tabular-nums tracking-tight",
                        status === "listening" || status === "silent" ? "text-slate-800" : "text-slate-300",
                    )}
                >
                    {formatDuration(duration)}
                </span>
            </div>

            <FailedChunkNotice count={failedChunkCount} className="mt-2" />

            <div className="mt-3 flex gap-2">
                <RecorderControls compact />
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={openConsultation}
                    className="flex cursor-pointer items-center gap-1 text-xs text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
                >
                    Back to consultation
                    <ArrowUpRightIcon className="size-3.5" />
                </button>
                <DiscardSessionDialog onConfirm={discardSession} />
            </div>
        </div>
    );
}
