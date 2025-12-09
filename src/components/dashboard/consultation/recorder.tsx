import useSessionRecorder from "@/hooks/use-session-recorder";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router";
import { AudioVisualizerMemo } from "./visualizer";
// import { Mic, MicOff } from "lucide-react";

export default function Recorder() {
    const navigate = useNavigate();

    const { duration, isRecording, stopRecording, discardRecording, stream } = useSessionRecorder({ chunkSizeInMs: 60 * 1000 });
    const durationMinutes = Math.floor(duration / 60).toString().padStart(2, '0');
    const durationSeconds = (Math.floor(duration) % 60).toString().padStart(2, '0');


    const handleStopAndProceed = () => {
        stopRecording();
        navigate({ to: "/dashboard/prescribe/$consultationId", params: { consultationId: "1" } });
    }

    const handleDiscard = () => {
        discardRecording();
        navigate({ to: "/dashboard" });
    }

    return (
        <Card className="w-full">
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-center mb-4">
                        <div
                            aria-label={isRecording ? 'Microphone on' : 'Microphone off'}
                            className={`relative inline-flex items-center justify-center rounded-full`}
                        >
                            {/* Ping effect (only when active) */}
                            {isRecording && (
                                <span
                                    aria-hidden
                                    className="absolute inline-flex h-full w-full items-center justify-center"
                                >
                                    {/* The ping circle (expanding, low-opacity) */}
                                    <span className="absolute inline-flex h-3/4 w-3/4 rounded-full bg-rose-400 opacity-60 animate-ping" />


                                    {/* The steady glow behind the mic */}
                                    <span className="absolute inline-flex h-1/3 w-1/3 rounded-full bg-rose-600 opacity-90" />
                                </span>
                            )}

                            <div className="relative z-10 flex items-center justify-center w-9 h-9" />

                        </div>

                        {/* {isRecording ? <Mic className="w-8 h-8 text-rose-600 ml-2" /> : <MicOff className="w-8 h-8 text-gray-400 ml-2" />} */}
                    </div>


                    <pre className="text-xl">
                        {durationMinutes}:{durationSeconds}
                    </pre>

                </div>

                <AudioVisualizerMemo stream={stream} />
            </CardContent>
            <CardFooter className="flex gap-2 items-center justify-center">
                <Button variant="outline" className="" onClick={handleDiscard}>
                    Discard Session
                </Button>
                <Button className="" onClick={handleStopAndProceed}>
                    Proceed to Prescribe
                </Button>

            </CardFooter>
        </Card>
    )
}