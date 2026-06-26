import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { DOSE_UNITS, type RxOption } from "@/constants/prescription";
import { parseFraction, toFractionLabel } from "@/lib/rx-format";
import type { MedicineDose } from "@/types/prescription";
import Combobox, { type ComboboxOption } from "./combobox";

interface DoseInputProps {
    dose?: MedicineDose;
    onChange: (dose: MedicineDose) => void;
    unitOptions?: readonly RxOption[];
    amountPlaceholder?: string;
    unitPlaceholder?: string;
}

const AMOUNT_PRESETS = ["½", "1", "1½", "2"];

const toUnitOptions = (units: readonly RxOption[]): ComboboxOption[] =>
    units.map(unit => ({ value: unit.code, label: unit.code, hint: unit.fullForm }));

// Amount (typed decimals/fractions normalise to ½, 1¼ on blur) + a searchable unit picker.
export default function DoseInput({
    dose,
    onChange,
    unitOptions = DOSE_UNITS,
    amountPlaceholder = "1",
    unitPlaceholder = "unit",
}: DoseInputProps) {
    const amount = dose?.amount ?? "";
    const unit = dose?.unit ?? "";

    const normalizeAmount = () => {
        const parsed = parseFraction(amount);
        if (parsed) onChange({ amount: toFractionLabel(parsed), unit });
    };

    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <Input
                    value={amount}
                    onChange={event => onChange({ amount: event.target.value, unit })}
                    onBlur={normalizeAmount}
                    placeholder={amountPlaceholder}
                    className="h-10 w-20 text-center text-base sm:text-sm"
                />
                <div className="flex-1">
                    <Combobox
                        value={unit}
                        onChange={nextUnit => onChange({ amount, unit: nextUnit })}
                        options={toUnitOptions(unitOptions)}
                        placeholder={unitPlaceholder}
                        allowCustom
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
