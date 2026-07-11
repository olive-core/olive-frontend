import { useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useLetterheadOnboarding } from "@/stores/letterhead-onboarding-store";

interface ClinicianPadStatus {
    header_config?: unknown | null;
}

// A wordless preview of a prescription pad's top: logo, doctor lines, contact lines, an
// accent rule and a faint "Rx" body — so the invitation reads even to a doctor who
// skims past the text.
function LetterheadPreview() {
    return (
        <div className="mx-auto w-full max-w-xs rounded-lg border bg-white p-3 shadow-sm">
            <div className="flex items-start gap-2.5">
                <div className="size-8 shrink-0 rounded-full bg-emerald-100" />
                <div className="flex-1 space-y-1">
                    <div className="h-2 w-2/3 rounded bg-slate-300" />
                    <div className="h-1.5 w-1/2 rounded bg-slate-200" />
                    <div className="h-1.5 w-2/5 rounded bg-emerald-200" />
                </div>
                <div className="w-1/4 space-y-1">
                    <div className="h-1.5 w-full rounded bg-slate-200" />
                    <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                </div>
            </div>
            <div className="my-2 h-0.5 rounded bg-emerald-400" />
            <div className="flex items-start gap-2">
                <span className="font-serif text-lg italic leading-none text-emerald-500">℞</span>
                <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-1.5 w-4/5 rounded bg-slate-100" />
                    <div className="h-1.5 w-3/5 rounded bg-slate-100" />
                    <div className="h-1.5 w-2/3 rounded bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

export default function LetterheadInviteDialog() {
    const navigate = useNavigate();
    const userId = useAuthStore((state) => state.userId);
    const activeView = useAuthStore((state) => state.activeView);
    const { dismissed, dismiss } = useLetterheadOnboarding();

    // The pad editor is the invitation's own destination, so never overlay it there.
    const onPadEditor = useLocation({ select: (l) => l.pathname.startsWith("/doctor/prescription-header") });

    const { data } = useQuery<ClinicianPadStatus>({
        queryKey: ["clinician", userId],
        queryFn: async () => (await api.get(`/clinician/${userId}`)).data,
        enabled: Boolean(userId) && activeView === "doctor" && !dismissed,
    });

    const needsPad = Boolean(data) && !data?.header_config;
    const open = activeView === "doctor" && !dismissed && !onPadEditor && needsPad;

    const setUp = () => {
        dismiss();
        navigate({ to: "/doctor/prescription-header", search: { tab: "doctor" } });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Make it your own prescription pad</DialogTitle>
                    <DialogDescription className="text-center">
                        Add your name, degree, chambers and logo — so every prescription prints looking
                        professionally yours.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <LetterheadPreview />
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button variant="outline" onClick={dismiss}>
                        Maybe later
                    </Button>
                    <Button onClick={setUp}>Set up my pad</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
