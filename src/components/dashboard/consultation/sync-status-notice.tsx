import { useRecordingSession } from "@/hooks/use-recording-session";
import type { QueueStatus } from "@/lib/audio-queue";
import { cn } from "@/lib/utils";

// What the doctor needs to know about audio that has not reached the server yet. Silence
// while everything is synced; the truth, with numbers, whenever it is not.
function noticeFor({ health, pending, rejected }: QueueStatus): { text: string; tone: string } | null {
    switch (health) {
        case "syncing":
            return { text: `Saving to server. ${pending} left.`, tone: "text-slate-500" };
        case "waiting":
            return { text: `Waiting for network. ${pending} saved on this device.`, tone: "text-amber-700" };
        case "attention":
            return { text: `${rejected} could not be sent. Still saved on this device.`, tone: "text-rose-700" };
        default:
            return null;
    }
}

export default function SyncStatusNotice({ className }: { className?: string }) {
    const { queue } = useRecordingSession();
    const notice = noticeFor(queue);
    if (!notice) return null;

    return (
        <p className={cn("text-xs font-medium", notice.tone, className)}>
            {notice.text}
        </p>
    );
}
