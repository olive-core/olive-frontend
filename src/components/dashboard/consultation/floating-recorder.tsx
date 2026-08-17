import { useState, type Ref } from "react";
import { ArrowUpRightIcon, ChevronUpIcon, MinusIcon } from "lucide-react";

import { useRecordingSession } from "@/hooks/use-recording-session";
import { useRecordingSessionActions } from "@/hooks/use-recording-session-actions";
import { cn, formatDuration } from "@/lib/utils";
import RecordingStatus, { RecordingStatusDot } from "./recording-status";
import RecorderControls from "./recorder-controls";
import SyncStatusNotice from "./sync-status-notice";
import DiscardSessionDialog from "./discard-session-dialog";
import { rememberRecorderRect, useRecorderMorph } from "./recorder-morph";

// The recording follows the doctor. Once the consultation screen is no longer on screen,
// the running recorder reappears here — same session, same controls — so looking up a
// past prescription or a chamber setting mid-consultation never costs the conversation.
//
// It shows for EVERY state of a live session, including a microphone that is still
// opening or was blocked. A doctor who has navigated away must never be left with a
// session running somewhere and no way to reach it.
export default function FloatingRecorder() {
    const { target, hasInlineRecorder } = useRecordingSession();

    if (!target || hasInlineRecorder) return null;

    return <FloatingRecorderWidget />;
}

// A phone has no corner to spare, so the panel spans the screen there and only becomes a
// corner card from `sm` up. Either way it can be folded down to a pill, which is how the
// doctor gets the screen back without ending the recording.
const DOCKED = "fixed z-50 print:hidden";
const SAFE_BOTTOM = "calc(0.75rem + env(safe-area-inset-bottom))";

function FloatingRecorderWidget() {
    const [isMinimized, setIsMinimized] = useState(false);
    const ref = useRecorderMorph<HTMLDivElement>(isMinimized ? "pill" : "panel");

    // The rect has to be read before React lays the new shape out, so it is captured here
    // rather than in the morph effect.
    const toggleMinimized = () => {
        rememberRecorderRect(ref.current);
        setIsMinimized((minimized) => !minimized);
    };

    return isMinimized
        ? <MinimizedRecorder ref={ref} onExpand={toggleMinimized} />
        : <ExpandedRecorder ref={ref} onMinimize={toggleMinimized} />;
}

function ExpandedRecorder({ ref, onMinimize }: { ref: Ref<HTMLDivElement>; onMinimize: () => void }) {
    const { status, duration } = useRecordingSession();
    const { discardSession, openConsultation } = useRecordingSessionActions();

    return (
        <div
            ref={ref}
            role="region"
            aria-label="Recording in progress"
            className={cn(
                DOCKED,
                "inset-x-3 rounded-xl border bg-white p-3 shadow-lg sm:inset-x-auto sm:right-4 sm:w-80",
                status === "listening" && "rec-card-glow",
            )}
            style={{ bottom: SAFE_BOTTOM }}
        >
            <div className="flex items-center justify-between gap-2">
                <RecordingStatus status={status} />
                <div className="flex shrink-0 items-center gap-1">
                    <span
                        className={cn(
                            "text-xl font-light tabular-nums tracking-tight",
                            status === "listening" || status === "silent" ? "text-slate-800" : "text-slate-300",
                        )}
                    >
                        {formatDuration(duration)}
                    </span>
                    <button
                        type="button"
                        onClick={onMinimize}
                        aria-label="Minimise recorder"
                        className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <MinusIcon className="size-4" />
                    </button>
                </div>
            </div>

            <SyncStatusNotice className="mt-2" />

            <div className="mt-3 flex gap-2">
                <RecorderControls compact />
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
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

function MinimizedRecorder({ ref, onExpand }: { ref: Ref<HTMLDivElement>; onExpand: () => void }) {
    const { status, duration } = useRecordingSession();

    return (
        <div
            ref={ref}
            role="region"
            aria-label="Recording in progress"
            className={cn(DOCKED, "right-3 sm:right-4", status === "listening" && "rec-card-glow rounded-full")}
            style={{ bottom: SAFE_BOTTOM }}
        >
            <button
                type="button"
                onClick={onExpand}
                aria-label="Show recording controls"
                className="flex cursor-pointer items-center gap-2 rounded-full border bg-white py-2 pl-3 pr-2.5 shadow-lg"
            >
                <RecordingStatusDot status={status} />
                <span className="text-sm font-light tabular-nums tracking-tight text-slate-800">
                    {formatDuration(duration)}
                </span>
                <ChevronUpIcon className="size-4 text-slate-400" />
            </button>
        </div>
    );
}
