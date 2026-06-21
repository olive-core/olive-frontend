import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface GraceWarningDialogProps {
    open: boolean;
    remaining: number;
    onContinue: () => void;
    onRenew: () => void;
    onOpenChange: (open: boolean) => void;
}

export default function GraceWarningDialog({ open, remaining, onContinue, onRenew, onOpenChange }: GraceWarningDialogProps) {
    const isLast = remaining <= 1;
    const title = isLast ? "This is your last grace consultation" : "Your membership has expired";
    const description = isLast
        ? "After this consultation you'll need an active membership to continue. Renew now to avoid interruption."
        : `${remaining} consultations left in your grace period. Renew to keep your founding rate.`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <AlertTriangleIcon className="size-6" />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button variant="outline" onClick={onContinue}>
                        Continue consultation
                    </Button>
                    <Button onClick={onRenew}>Renew now</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
