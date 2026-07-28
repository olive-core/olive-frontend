import { Link } from "@tanstack/react-router";
import { MicIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { lastMicCheck } from "@/lib/mic-check-history";
import { MIC_VERDICT_COPY } from "@/lib/mic-check";

export default function DeviceCheckCard() {
    const previous = lastMicCheck();

    return (
        <Card className="w-full">
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Device</p>
                    <p className="text-xs text-slate-700">
                        Check that Olive can hear you, any time — before a clinic, or after changing headsets.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                        <MicIcon className="mt-0.5 size-4 shrink-0 text-slate-700" />
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-900">Microphone check</p>
                            <p className="text-xs text-slate-700">
                                {previous
                                    ? `Last checked ${previous.checkedOn} — ${MIC_VERDICT_COPY[previous.verdict].title.toLowerCase()}`
                                    : "Not checked yet"}
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/doctor/device-check">Run test</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
