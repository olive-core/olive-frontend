import { useNavigate } from "@tanstack/react-router";
import { LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionGate } from "@/stores/subscription-gate-store";

export default function SubscriptionBlockedDialog() {
    const { blocked, clear } = useSubscriptionGate();
    const navigate = useNavigate();

    const expired = Boolean(blocked?.subscription_until);
    const title = expired ? "Your membership has expired" : "Your free trial has ended";
    const description = expired
        ? "Renew your membership to start a new consultation — your founding rate is still locked in."
        : "Activate your Olive membership to start a new consultation.";

    const goToBilling = () => {
        clear();
        navigate({ to: "/doctor/billing" });
    };

    return (
        <Dialog open={Boolean(blocked)} onOpenChange={(open) => !open && clear()}>
            <DialogContent>
                <DialogHeader>
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <LockIcon className="size-6" />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button variant="outline" onClick={clear}>
                        Not now
                    </Button>
                    <Button onClick={goToBilling}>View membership</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
