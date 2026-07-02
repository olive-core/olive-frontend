import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { DURATION_PRESETS, DURATION_UNITS } from "@/constants/prescription";
import type { MedicineDuration } from "@/types/prescription";

interface DurationInputProps {
    duration?: MedicineDuration;
    onChange: (duration: MedicineDuration) => void;
}

// A fixed-length course (number + Days/Weeks/Months) OR an open-ended preset
// (Continue / Till Review / Stat / SOS). Choosing one path clears the other.
export default function DurationInput({ duration, onChange }: DurationInputProps) {
    const value = duration?.value ?? null;
    const unit = duration?.unit ?? "Days";
    const preset = duration?.preset ?? "";

    const setValue = (raw: string) => {
        const parsed = raw === "" ? null : Number(raw);
        onChange({ value: Number.isNaN(parsed as number) ? null : parsed, unit, preset: undefined });
    };

    const togglePreset = (code: string) => {
        onChange(preset === code ? {} : { preset: code, value: null, unit: undefined });
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={value ?? ""}
                    onChange={event => setValue(event.target.value)}
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    className={cn("h-10 w-20 text-center text-base sm:text-sm", preset && "opacity-50")}
                />
                <div className="flex gap-1">
                    {DURATION_UNITS.map(option => (
                        <button
                            key={option.code}
                            type="button"
                            onClick={() => onChange({ value, unit: option.code, preset: undefined })}
                            className={cn(
                                "px-3 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                                !preset && unit === option.code
                                    ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                                    : "border-slate-200 text-slate-500 hover:bg-slate-50",
                            )}
                        >
                            {option.code}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map(option => (
                    <button
                        key={option.code}
                        type="button"
                        onClick={() => togglePreset(option.code)}
                        title={option.fullForm}
                        className={cn(
                            "px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                            preset === option.code
                                ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50",
                        )}
                    >
                        {option.code}
                    </button>
                ))}
            </div>
        </div>
    );
}
