import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { padStateIsConfigured } from "@/lib/chamber-pad";
import { useHeaderConfigStore, type EditorTab } from "@/stores/header-config-store";

interface SetupStep {
    tab:       EditorTab;
    label:     string;
    hint:      string;
    optional?: boolean;
    done:      boolean;
}

// First-run guidance for the pad editor: a slim ordered strip that shows what to fill
// and in what order. It reads completion from the live editor state (so a step ticks
// the moment its section has content) and retires once the essentials — the doctor's
// details and a chamber — are in place. Style and footer are optional polish, offered
// for orientation but never gating.
export default function PadSetupChecklist() {
    const qualification = useHeaderConfigStore((state) => state.identity.qualification);
    const designation   = useHeaderConfigStore((state) => state.config.designation);
    const chambers      = useHeaderConfigStore((state) => state.chambers);
    const pads          = useHeaderConfigStore((state) => state.pads);
    const setActiveTab  = useHeaderConfigStore((state) => state.setActiveTab);

    const detailsDone = Boolean(qualification.trim() && designation.trim());
    const chamberDone = chambers.some((chamber) => {
        const pad = pads[chamber.chamber_id];
        return pad ? padStateIsConfigured(pad) : false;
    });

    if (detailsDone && chamberDone) return null;

    const steps: SetupStep[] = [
        { tab: "doctor",   label: "Your details",     hint: "Degree, specialty",     done: detailsDone },
        { tab: "chambers", label: "Add your chamber", hint: "Address, phone, hours", done: chamberDone },
        { tab: "style",    label: "Style & logo",     hint: "Colour, layout", optional: true, done: false },
        { tab: "footer",   label: "Footer",           hint: "Bottom line",    optional: true, done: false },
    ];

    const currentTab = steps.find((step) => !step.optional && !step.done)?.tab;

    return (
        <div className="rounded-xl border bg-slate-50 px-3 py-2.5">
            <p className="mb-2 text-xs font-semibold text-slate-500">Set up your pad</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {steps.map((step, index) => (
                    <StepChip
                        key={step.tab}
                        number={index + 1}
                        step={step}
                        isCurrent={step.tab === currentTab}
                        onClick={() => setActiveTab(step.tab)}
                    />
                ))}
            </div>
        </div>
    );
}

interface StepChipProps {
    number:    number;
    step:      SetupStep;
    isCurrent: boolean;
    onClick:   () => void;
}

function StepChip({ number, step, isCurrent, onClick }: StepChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex min-w-[8.5rem] shrink-0 items-center gap-2 rounded-lg border bg-white px-2.5 py-2 text-left transition-colors hover:border-emerald-300",
                isCurrent && "border-emerald-400 ring-1 ring-emerald-400",
                step.done && "border-emerald-200",
            )}
        >
            <StepBadge number={number} done={step.done} isCurrent={isCurrent} />
            <span className="leading-tight">
                <span className="block text-xs font-semibold text-slate-700">
                    {step.label}
                    {step.optional && <span className="ml-1 font-normal text-slate-400">· optional</span>}
                </span>
                <span className="block text-[11px] text-slate-400">{step.hint}</span>
            </span>
        </button>
    );
}

function StepBadge({ number, done, isCurrent }: { number: number; done: boolean; isCurrent: boolean }) {
    return (
        <span
            className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                done
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-400",
            )}
        >
            {done ? <CheckIcon className="size-3" /> : number}
        </span>
    );
}
