import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { DURATION_PRESETS, DURATION_UNITS } from "@/constants/prescription";
import type { MedicineDuration } from "@/types/prescription";
import RxChip from "./rx-chip";

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
            <div className="flex flex-wrap gap-2">
                <Input
                    value={value ?? ""}
                    onChange={event => setValue(event.target.value)}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="e.g. 5"
                    aria-label="Course length"
                    className={cn("h-11 sm:h-10 w-20 text-center text-base sm:text-sm", preset && "opacity-50")}
                />
                <div className="flex gap-1">
                    {DURATION_UNITS.map(option => (
                        <RxChip
                            key={option.code}
                            label={option.code}
                            active={!preset && unit === option.code}
                            onClick={() => onChange({ value, unit: option.code, preset: undefined })}
                            className="sm:px-3"
                        />
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map(option => (
                    <RxChip
                        key={option.code}
                        label={option.code}
                        title={option.fullForm}
                        active={preset === option.code}
                        onClick={() => togglePreset(option.code)}
                    />
                ))}
            </div>
        </div>
    );
}
