import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRecordingSession } from "@/hooks/use-recording-session";
import { useRecordingSessionActions } from "@/hooks/use-recording-session-actions";

// What the recording offers right now. One component decides it for both surfaces, so
// the consultation card and the floating widget can never disagree about which actions
// are available — only about how much room they have to draw them.
export default function RecorderControls({ compact = false }: { compact?: boolean }) {
    const { status, pauseRecording, resumeRecording, retryRecording } = useRecordingSession();
    const { finishAndPrescribe } = useRecordingSessionActions();

    if (status === "unavailable") {
        return (
            <Button variant="outline" className="flex-1" onClick={retryRecording}>
                <RotateCcwIcon className="size-4" />
                Try again
            </Button>
        );
    }

    const isPaused = status === "paused";
    const label = isPaused ? "Resume recording" : "Pause recording";
    const icon = isPaused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />;

    return (
        <>
            <Button
                variant="outline"
                size={compact ? "icon" : "default"}
                className={compact ? undefined : "flex-1"}
                aria-label={label}
                disabled={status === "starting"}
                onClick={isPaused ? resumeRecording : pauseRecording}
            >
                {icon}
                {!compact && (isPaused ? "Resume" : "Pause")}
            </Button>
            <Button className="flex-1" onClick={finishAndPrescribe}>
                Finish &amp; Prescribe
            </Button>
        </>
    );
}
