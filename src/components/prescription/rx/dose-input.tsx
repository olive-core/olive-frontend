import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { DOSE_UNITS, type RxOption } from "@/constants/prescription";
import type { MedicineDose } from "@/types/prescription";
import SuggestInput from "./suggest-input";

interface DoseInputProps {
    dose?: MedicineDose;
    onChange: (dose: MedicineDose) => void;
    unitOptions?: readonly RxOption[];
    amountPlaceholder?: string;
    unitPlaceholder?: string;
}

const AMOUNT_PRESETS = ["½", "1", "1½", "2"];

// Amount (with quick presets for minimal typing) + a typeahead unit picker.
export default function DoseInput({
    dose,
    onChange,
    unitOptions = DOSE_UNITS,
    amountPlaceholder = "1",
    unitPlaceholder = "unit",
}: DoseInputProps) {
    const amount = dose?.amount ?? "";
    const unit = dose?.unit ?? "";

    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <Input
                    value={amount}
                    onChange={event => onChange({ amount: event.target.value, unit })}
                    placeholder={amountPlaceholder}
                    className="h-10 w-20 text-center text-base sm:text-sm"
                />
                <div className="flex-1">
                    <SuggestInput
                        value={unit}
                        onChange={nextUnit => onChange({ amount, unit: nextUnit })}
                        options={unitOptions}
                        placeholder={unitPlaceholder}
                    />
                </div>
            </div>
            <div className="flex gap-1.5">
                {AMOUNT_PRESETS.map(preset => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => onChange({ amount: preset, unit })}
                        className={cn(
                            "px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                            amount === preset
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50",
                        )}
                    >
                        {preset}
                    </button>
                ))}
            </div>
        </div>
    );
}
