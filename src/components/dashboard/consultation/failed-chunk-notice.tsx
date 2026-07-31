import { cn } from "@/lib/utils";

// A chunk that never lands is audio the doctor believes was captured, so the loss is
// stated plainly wherever the recording is on screen.
export default function FailedChunkNotice({ count, className }: { count: number; className?: string }) {
    if (count === 0) return null;

    return (
        <p className={cn("text-xs font-medium text-amber-700", className)}>
            {count} audio {count === 1 ? "piece" : "pieces"} could not be uploaded — check your
            internet connection.
        </p>
    );
}
