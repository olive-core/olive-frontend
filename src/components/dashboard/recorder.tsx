import useSessionRecorder from "@/hooks/use-session-recorder";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { useNavigate, useParams } from "react-router";

export default function Recorder() {

    const navigate = useNavigate();
    const { id } = useParams();



    const { duration, isRecording, stopRecording, discardRecording } = useSessionRecorder({ chunkSizeInMs: 60 * 1000 });
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = (Math.floor(duration) % 60).toString().padStart(2, '0');

    const handleStopAndProceed = () => {
        stopRecording();
        navigate(`/dashboard/prescribe/${id}`);
    }

    const handleDiscard = () => {
        discardRecording();
        navigate('/dashboard');
    }

    return (
        <Card className="w-96">

            <CardContent>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center">
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

                    <div className="mt-4 text-2xl">
                        {durationMinutes}:{durationSeconds}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button className="w-full" onClick={handleStopAndProceed}>
                    Proceed to Prescribe
                </Button>
                <Button variant="outline" className="w-full" onClick={handleDiscard}>
                    Discard Session
                </Button>
            </CardFooter>
        </Card>
    )
}