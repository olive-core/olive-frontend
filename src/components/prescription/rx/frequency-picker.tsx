import { Clock } from "lucide-react";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { getFrequency } from "@/constants/prescription";
import { formatCount, formatSchedule } from "@/lib/rx-format";
import type { MedicineSchedule } from "@/types/prescription";
import type { FrequencyMode } from "./rx-type-config";

interface FrequencyPickerProps {
    schedule: MedicineSchedule;
    mode: FrequencyMode;
    onChange: (schedule: MedicineSchedule) => void;
}

const CYCLE = [0, 0.5, 1, 2, 3];
const nextCount = (value?: number) => CYCLE[(CYCLE.indexOf(value ?? 0) + 1) % CYCLE.length];

const MEAL_QUICK = [
    { code: "OD", morning: 1, noon: 0, night: 0 },
    { code: "BD", morning: 1, noon: 0, night: 1 },
    { code: "TDS", morning: 1, noon: 1, night: 1 },
    { code: "HS", morning: 0, noon: 0, night: 1 },
];

const CODE_CHIPS = ["OD", "BD", "TDS", "QDS", "Q6H", "Q8H", "Q12H", "HS", "SOS", "PRN", "Stat"];

export default function FrequencyPicker({ schedule, mode, onChange }: FrequencyPickerProps) {
    const preview = formatSchedule(schedule);

    if (mode === "code") {
        const setCode = (code: string) =>
            onChange({ ...schedule, code, morning: undefined, noon: undefined, night: undefined, gapHours: undefined });
        const setGapHours = (raw: string) => {
            const hours = raw === "" ? undefined : Number(raw);
            onChange({ ...schedule, gapHours: Number.isNaN(hours as number) ? undefined : hours, code: undefined });
        };
        return (
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                    {CODE_CHIPS.map(code => (
                        <Chip key={code} active={schedule.code === code} label={code} title={getFrequency(code)?.fullForm} onClick={() => setCode(code)} />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={15} className="text-emerald-500" />
                    <span className="text-sm text-slate-600">or every</span>
                    <Input
                        value={schedule.gapHours ?? ""}
                        onChange={event => setGapHours(event.target.value)}
                        type="number"
                        className="w-20 h-8 text-center"
                    />
                    <span className="text-sm text-slate-600">hours</span>
                    <span className="ml-auto text-sm font-semibold text-slate-800">{preview}</span>
                </div>
            </div>
        );
    }

    const timing = schedule.timing === "before" ? "before" : "after";
    const setTiming = (value: "before" | "after") => onChange({ ...schedule, timing: value });
    const clearCode = { code: undefined, gapHours: undefined };
    const applyQuick = (quick: typeof MEAL_QUICK[number]) =>
        onChange({ timing, morning: quick.morning, noon: quick.noon, night: quick.night, ...clearCode });

    return (
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center gap-3">
                <div className="flex p-0.5 bg-slate-200/50 border border-slate-200 rounded-lg">
                    <TimingButton label="After meal" active={timing === "after"} onClick={() => setTiming("after")} />
                    <TimingButton label="Before meal" active={timing === "before"} onClick={() => setTiming("before")} />
                </div>
                <span className="ml-auto font-mono font-bold text-base tracking-wider text-slate-800">{preview}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <MealCell label="Morning" value={schedule.morning} onClick={() => onChange({ ...schedule, timing, morning: nextCount(schedule.morning), ...clearCode })} />
                <MealCell label="Noon" value={schedule.noon} onClick={() => onChange({ ...schedule, timing, noon: nextCount(schedule.noon), ...clearCode })} />
                <MealCell label="Night" value={schedule.night} onClick={() => onChange({ ...schedule, timing, night: nextCount(schedule.night), ...clearCode })} />
            </div>

            <div className="flex flex-wrap gap-1.5">
                {MEAL_QUICK.map(quick => (
                    <Chip key={quick.code} active={schedule.code === quick.code} label={quick.code} title={getFrequency(quick.code)?.fullForm} onClick={() => applyQuick(quick)} />
                ))}
                <Chip label="QDS" title={getFrequency("QDS")?.fullForm} active={schedule.gapHours === 6} onClick={() => onChange({ timing, gapHours: 6, code: "QDS" })} />
            </div>
        </div>
    );
}

function Chip({ label, title, active, onClick }: { label: string; title?: string; active?: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                active ? "bg-emerald-600 border-emerald-600 text-white font-semibold" : "border-slate-200 text-slate-500 hover:bg-slate-50",
            )}
        >
            {label}
        </button>
    );
}

function TimingButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer",
                active ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600",
            )}
        >
            {label}
        </button>
    );
}

function MealCell({ label, value, onClick }: { label: string; value?: number; onClick: () => void }) {
    const active = !!value;
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg border transition-colors cursor-pointer",
                active ? "bg-white border-emerald-300 shadow-sm" : "bg-slate-100/60 border-slate-200 hover:bg-white",
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{label}</span>
            <span className={cn("text-xl font-bold leading-none", active ? "text-emerald-600" : "text-slate-300")}>{formatCount(value)}</span>
        </button>
    );
}
