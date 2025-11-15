import useSessionRecorder from "@/hooks/use-session-recorder";
import { useEffect } from "react";

export default function Recorder() {

    const { duration } = useSessionRecorder({ chunkSizeInMs: 5 * 1000 });
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration) % 60;

    useEffect(() => {
        console.log("Recording duration updated:", duration);
    }, [duration])

    return <div>
        {`Recording duration: ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`}
    </div>
}