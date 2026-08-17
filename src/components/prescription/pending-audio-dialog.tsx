import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PendingAudioDialogProps {
    unsentCount: number | null;
    onKeepWaiting: () => void;
    onGenerateAnyway: () => void;
}

// Generating from a partial recording and waiting forever are both wrong answers, and
// only the doctor can weigh them. So the trade is named, with the real count in it, and
// handed over rather than decided quietly.
export default function PendingAudioDialog({
    unsentCount,
    onKeepWaiting,
    onGenerateAnyway,
}: PendingAudioDialogProps) {
    const isOpen = unsentCount !== null && unsentCount > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onKeepWaiting()}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Some audio has not uploaded</DialogTitle>
                    <DialogDescription>
                        {unsentCount} {unsentCount === 1 ? "piece" : "pieces"} of this
                        consultation are saved on this device but not on the server. A draft
                        made now will be missing whatever was said in them.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onGenerateAnyway}>
                        Generate anyway
                    </Button>
                    <Button onClick={onKeepWaiting}>Keep waiting</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
