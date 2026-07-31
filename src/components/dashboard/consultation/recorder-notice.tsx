import { MicIcon, SquareCheckBigIcon, type LucideIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRecordingSessionActions } from "@/hooks/use-recording-session-actions";

// The two states where a consultation screen must not offer a recorder: another
// patient's consultation is still being recorded, or this one's recording is over.
// Both replace the card with the single action that moves the doctor forward, so a
// stray visit can never start a second recording or re-record a finished one.

function NoticeCard({
    icon: Icon,
    title,
    body,
    actionLabel,
    onAction,
}: {
    icon:        LucideIcon;
    title:       string;
    body:        string;
    actionLabel: string;
    onAction:    () => void;
}) {
    return (
        <Card className="w-full py-5">
            <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
                <Icon className="size-6 text-slate-300" />
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="max-w-[38ch] text-xs text-slate-500">{body}</p>
                <Button variant="outline" className="mt-1" onClick={onAction}>
                    {actionLabel}
                </Button>
            </CardContent>
        </Card>
    );
}

export function RecordingBusyElsewhereNotice() {
    const { openConsultation } = useRecordingSessionActions();

    return (
        <NoticeCard
            icon={MicIcon}
            title="Another consultation is still recording"
            body="Finish that recording before starting this one — only one consultation can be recorded at a time."
            actionLabel="Go to the running recording"
            onAction={openConsultation}
        />
    );
}

export function RecordingFinishedNotice({ consultationId }: { consultationId: string }) {
    const navigate = useNavigate();

    return (
        <NoticeCard
            icon={SquareCheckBigIcon}
            title="Recording finished"
            body="This consultation has already been recorded. Continue to the prescription to review the draft."
            actionLabel="Continue to prescription"
            onAction={() => navigate({ to: "/doctor/prescribe/$consultationId", params: { consultationId } })}
        />
    );
}
