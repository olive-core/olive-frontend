import useSessionRecorder from "@/hooks/use-session-recorder";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useNavigate, useParams } from "@tanstack/react-router";
import { trackRecordingFinalization } from "@/lib/recording-finalization";
import { releaseQueueSession } from "@/lib/attendant-queue";
import { deleteSession } from "@/lib/session";
// import { AudioVisualizerMemo } from "./visualizer"; // disabled — see waveform block below
import RecordingStatus, { type RecorderStatus } from "./recording-status";
import DiscardSessionDialog from "./discard-session-dialog";
import { PauseIcon, PlayIcon } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export default function Recorder() {

    const { consultationId } = useParams({ from: "/doctor/consultation/$userId/$consultationId" });
    const navigate = useNavigate();

    const {
        duration,
        isPaused,
        isSilent,
        pauseRecording,
        resumeRecording,
        stopRecording,
        discardRecording,
        // stream, // re-add when restoring the AudioVisualizer below
    } = useSessionRecorder({ chunkSizeInMs: 30 * 1000, consultationId });

    const status: RecorderStatus = isPaused ? "paused" : isSilent ? "silent" : "listening";
    const isListening = status === "listening";

    const handleStopAndProceed = () => {
        // Let the final chunk upload finish in the background; the prescribe screen
        // waits on it behind its loading skeleton before generating the draft.
        trackRecordingFinalization(consultationId, stopRecording());
        navigate({ to: "/doctor/prescribe/$consultationId", params: { consultationId } });
    }

    const handleDiscard = () => {
        // Once in-flight uploads settle, delete the abandoned session and its audio.
        // Fire-and-forget so the exit stays instant.
        discardRecording().then(() => deleteSession(consultationId)).catch(() => {});
        // Drop this patient from the queue (no-op for walk-ins). The queue panel
        // reconciles live via SSE, so we don't block the exit on the response.
        releaseQueueSession(consultationId).catch(() => {});
        navigate({ to: "/doctor" });
    }

    return (
        <Card className={cn("w-full gap-4 py-5 transition-shadow", isListening && "rec-card-glow")}>
            <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 pt-0">
                <RecordingStatus status={status} />

                <div
                    className={cn(
                        "text-4xl font-light tabular-nums tracking-tight transition-colors",
                        isPaused ? "text-slate-300" : "text-slate-800"
                    )}
                >
                    {formatDuration(duration)}
                </div>

                {/* Live audio waveform — disabled for now: it drew too much attention during the
                    consult. The breathing dot + silence warning already reassure capture. To bring
                    it back, uncomment this, the import, and the `stream` destructure above.
                <div className="w-full">
                    <AudioVisualizerMemo stream={stream} />
                </div> */}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <div className="flex w-full gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={isPaused ? resumeRecording : pauseRecording}
                    >
                        {isPaused ? (
                            <><PlayIcon className="size-4" /> Resume</>
                        ) : (
                            <><PauseIcon className="size-4" /> Pause</>
                        )}
                    </Button>
                    <Button className="flex-1" onClick={handleStopAndProceed}>
                        Finish &amp; Prescribe
                    </Button>
                </div>

                <DiscardSessionDialog onConfirm={handleDiscard} />
            </CardFooter>
        </Card>
    )
}
