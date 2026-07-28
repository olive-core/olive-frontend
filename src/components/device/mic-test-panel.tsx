import { useEffect } from "react";
import { CheckCircle2Icon, MicIcon, MicOffIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMicTest } from "@/hooks/use-mic-test";
import { MIC_VERDICT_COPY, type MicVerdict } from "@/lib/mic-check";
import { rememberMicCheck } from "@/lib/mic-check-history";
import type { AudioInput } from "@/lib/mic-meter";
import MicLevelBar from "./mic-level-bar";

const VERDICT_STYLE: Record<MicVerdict, { icon: typeof MicIcon; tone: string }> = {
    clear: { icon: CheckCircle2Icon,  tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
    faint: { icon: TriangleAlertIcon, tone: "border-amber-200 bg-amber-50 text-amber-900" },
    muted: { icon: MicOffIcon,        tone: "border-rose-200 bg-rose-50 text-rose-900" },
};

function VerdictCard({ verdict }: { verdict: MicVerdict }) {
    const { icon: Icon, tone } = VERDICT_STYLE[verdict];
    const { title, detail } = MIC_VERDICT_COPY[verdict];

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${tone}`}>
            <Icon className="mt-0.5 size-5 shrink-0" />
            <div className="flex flex-col gap-0.5">
                <p className="font-semibold">{title}</p>
                <p className="text-sm">{detail}</p>
            </div>
        </div>
    );
}

function InputLabel({ label }: { label: string }) {
    return (
        <p className="flex items-center gap-2 text-sm text-slate-900">
            <MicIcon className="size-4 text-slate-700" />
            Recording from <span className="font-semibold">{label}</span>
        </p>
    );
}

// Only shown when there is a real choice to make — one microphone needs no picker.
function InputPicker({
    inputs,
    activeDeviceId,
    onSelect,
    disabled,
}: {
    inputs: AudioInput[];
    activeDeviceId: string;
    onSelect: (deviceId: string) => void;
    disabled: boolean;
}) {
    if (inputs.length < 2) return null;

    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Microphone</span>
            <select
                value={activeDeviceId}
                disabled={disabled}
                onChange={(event) => onSelect(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-60"
            >
                {inputs.map((input) => (
                    <option key={input.deviceId} value={input.deviceId}>
                        {input.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

export default function MicTestPanel() {
    const {
        phase, level, inputLabel, inputs, activeDeviceId,
        verdict, playbackUrl, secondsLeft, start, record, reset,
    } = useMicTest();

    // A completed test is the day's mic check, so the dashboard chip stops asking.
    useEffect(() => {
        if (verdict) rememberMicCheck(verdict, inputLabel);
    }, [verdict, inputLabel]);

    return (
        <Card className="w-full">
            <CardContent className="flex flex-col gap-5">
                {phase === "idle" && (
                    <>
                        <p className="text-sm text-slate-900">
                            Check that Olive can hear you before your first patient. Takes about fifteen seconds.
                        </p>
                        <Button onClick={() => start()} className="self-start font-bold">
                            Start mic test
                        </Button>
                    </>
                )}

                {phase === "requesting" && (
                    <p className="text-sm text-slate-900">Waiting for microphone permission…</p>
                )}

                {phase === "denied" && (
                    <div className="flex flex-col gap-3">
                        <VerdictCard verdict="muted" />
                        <p className="text-sm text-slate-900">
                            Olive could not open your microphone. Allow microphone access for this site in your
                            browser settings, then test again.
                        </p>
                        <Button onClick={() => start()} className="self-start font-bold">Try again</Button>
                    </div>
                )}

                {(phase === "ready" || phase === "recording") && (
                    <div className="flex flex-col gap-4">
                        <InputPicker
                            inputs={inputs}
                            activeDeviceId={activeDeviceId}
                            onSelect={(deviceId) => start(deviceId)}
                            disabled={phase === "recording"}
                        />
                        <InputLabel label={inputLabel} />
                        <MicLevelBar level={level} />
                        {phase === "ready" ? (
                            <Button onClick={record} className="self-start font-bold">
                                Record 5 seconds
                            </Button>
                        ) : (
                            <p className="text-sm font-semibold text-emerald-700">
                                Recording — say a sentence out loud… {secondsLeft}s
                            </p>
                        )}
                    </div>
                )}

                {phase === "done" && verdict && (
                    <div className="flex flex-col gap-4">
                        <InputPicker
                            inputs={inputs}
                            activeDeviceId={activeDeviceId}
                            onSelect={(deviceId) => start(deviceId)}
                            disabled={false}
                        />
                        <InputLabel label={inputLabel} />
                        <VerdictCard verdict={verdict} />
                        {playbackUrl && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-sm font-semibold text-slate-900">
                                    This is exactly what Olive heard:
                                </p>
                                <audio controls src={playbackUrl} className="w-full" />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button onClick={() => start()} className="font-bold">Test again</Button>
                            <Button variant="outline" onClick={reset}>Done</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
