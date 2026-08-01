import { useEffect } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRecordingSession } from "@/hooks/use-recording-session";
import { useRecordingSessionActions } from "@/hooks/use-recording-session-actions";
import { cn, formatDuration } from "@/lib/utils";
import RecordingStatus from "./recording-status";
import RecorderControls from "./recorder-controls";
import FailedChunkNotice from "./failed-chunk-notice";
import DiscardSessionDialog from "./discard-session-dialog";
import { useRecorderMorph } from "./recorder-morph";

// The full recorder on the consultation screen. It renders the shared recording session,
// so leaving the page only hides this card — the microphone keeps running behind the
// floating widget, which the card visibly folds into as the doctor navigates away.
export default function RecorderCard() {
    const { status, duration, failedChunkCount, registerInlineRecorder } = useRecordingSession();
    const { discardSession } = useRecordingSessionActions();
    const ref = useRecorderMorph<HTMLDivElement>("card");

    // Only the live card stands in for the floating widget; a notice on the consultation
    // screen must not hide the controls for a recording running elsewhere.
    useEffect(registerInlineRecorder, [registerInlineRecorder]);

    return (
        <Card ref={ref} className={cn("w-full gap-4 py-5 transition-shadow", status === "listening" && "rec-card-glow")}>
            <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 pt-0">
                <RecordingStatus status={status} />

                <div
                    className={cn(
                        "text-4xl font-light tabular-nums tracking-tight transition-colors",
                        status === "listening" || status === "silent" ? "text-slate-800" : "text-slate-300",
                    )}
                >
                    {formatDuration(duration)}
                </div>

                <FailedChunkNotice count={failedChunkCount} className="max-w-xs text-center" />

                {/* Live audio waveform — disabled for now: it drew too much attention during
                    the consult. The breathing dot + silence warning already reassure capture.
                    To bring it back, render <AudioVisualizerMemo stream={stream} /> here and
                    expose `stream` on the recording session. */}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <div className="flex w-full gap-2">
                    <RecorderControls />
                </div>

                <DiscardSessionDialog onConfirm={discardSession} />
            </CardFooter>
        </Card>
    );
}
