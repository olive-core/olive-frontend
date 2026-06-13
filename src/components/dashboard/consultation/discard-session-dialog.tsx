import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Guards the destructive discard: a recorded conversation is easy to lose with a mis-tap.
export default function DiscardSessionDialog({ onConfirm }: { onConfirm: () => void }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="cursor-pointer text-xs text-slate-400 underline-offset-4 hover:text-rose-500 hover:underline"
                >
                    Discard session
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discard this session?</DialogTitle>
                    <DialogDescription>
                        The recorded conversation will be permanently deleted and no prescription
                        will be created. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Keep recording</Button>
                    </DialogClose>
                    <Button onClick={onConfirm} className="bg-rose-600 text-white hover:bg-rose-700">
                        Discard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
