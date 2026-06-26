import { CalendarDays, Crosshair, Droplets, Info, PillIcon, Repeat, Route as RouteIcon, Utensils } from "lucide-react";
import { Input } from "../../ui/input";
import RxField from "./rx-field";
import DoseInput from "./dose-input";
import Combobox, { type ComboboxOption } from "./combobox";
import FrequencyPicker from "./frequency-picker";
import DurationInput from "./duration-input";
import InstructionsInput from "./instructions-input";
import { cn } from "@/lib/utils";
import { DILUENT_UNITS, INJECTION_ROUTES, ROUTES, type RxOption } from "@/constants/prescription";
import { getSiteOptions } from "@/lib/rx-format";
import type { MedicineCategory } from "@/lib/dosage-form";
import type { MedicineDose, MedicineSchedule, MeedicineType } from "@/types/prescription";
import { getInstructions, type RxTypeConfig } from "./rx-type-config";

interface RxFormProps {
    medicine: MeedicineType;
    config: RxTypeConfig;
    onChange: (patch: Partial<MeedicineType>) => void;
}

const TIMING_CHIPS: { value: NonNullable<MedicineSchedule["timing"]>; label: string }[] = [
    { value: "after", label: "After meal" },
    { value: "before", label: "Before meal" },
    { value: "with", label: "With food" },
    { value: "empty", label: "Empty stomach" },
    { value: "bedtime", label: "Bedtime" },
];

const toComboOptions = (options: readonly RxOption[]): ComboboxOption[] =>
    options.map(option => ({ value: option.code, label: option.code, hint: option.fullForm }));

function routeOptions(category?: MedicineCategory) {
    if (category === "injection") return INJECTION_ROUTES;
    if (category === "suppository" || category === "enema") return ROUTES.filter(route => route.code === "P/R");
    if (category === "pessary" || category === "vaginal_cream") return ROUTES.filter(route => route.code === "P/V");
    return ROUTES;
}

// Renders only the fields the type's config declares — the progressive, per-type editor body.
export default function RxForm({ medicine, config, onChange }: RxFormProps) {
    const schedule = medicine.schedule ?? {};
    const setSchedule = (next: MedicineSchedule) => onChange({ schedule: next });

    return (
        <div className="space-y-3">
            {config.showRoute && (
                <RxField label="Route" icon={<RouteIcon size={12} />}>
                    <Combobox value={medicine.route ?? ""} onChange={route => onChange({ route })} options={toComboOptions(routeOptions(medicine.type))} placeholder="Select route" />
                </RxField>
            )}

            {config.doseMode === "explicit" && (
                <RxField label="Dose" icon={<PillIcon size={12} />}>
                    <DoseInput dose={medicine.dose} onChange={dose => onChange({ dose })} unitOptions={config.units} />
                </RxField>
            )}

            {config.showDiluent && (
                <RxField label="Dilute in" icon={<Droplets size={12} />}>
                    <DiluentInput value={medicine.dose?.diluent} onChange={diluent => onChange({ dose: { ...medicine.dose, diluent } })} />
                </RxField>
            )}

            <RxField label="Frequency" icon={<Repeat size={12} />}>
                <FrequencyPicker schedule={schedule} mode={config.frequencyMode} onChange={setSchedule} />
            </RxField>

            {config.showSite && (
                <RxField label="Site" icon={<Crosshair size={12} />}>
                    <Combobox value={medicine.site ?? ""} onChange={site => onChange({ site })} options={toComboOptions(getSiteOptions(medicine.type))} placeholder="Affected area / which eye, ear..." allowCustom />
                </RxField>
            )}

            {config.showMealTiming && (
                <RxField label="Meal timing" icon={<Utensils size={12} />}>
                    <div className="flex flex-wrap gap-1.5">
                        {TIMING_CHIPS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSchedule({ ...schedule, timing: option.value })}
                                className={cn(
                                    "px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                                    schedule.timing === option.value
                                        ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                                        : "border-slate-200 text-slate-500 hover:bg-slate-50",
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </RxField>
            )}

            <RxField label="Duration" icon={<CalendarDays size={12} />}>
                <DurationInput duration={medicine.duration} onChange={duration => onChange({ duration })} />
            </RxField>

            <RxField label="Instructions" icon={<Info size={12} />}>
                <InstructionsInput value={medicine.instructions ?? ""} onChange={instructions => onChange({ instructions })} suggestions={getInstructions(medicine.type)} />
            </RxField>
        </div>
    );
}

const DILUENT_PRESETS = ["2.5", "3", "5"];

// Dilution volume for nebulizers: an amount + unit like Dose. An empty amount = not diluted.
function DiluentInput({ value, onChange }: { value?: MedicineDose; onChange: (diluent: MedicineDose) => void }) {
    const amount = value?.amount ?? "";
    const unit = value?.unit ?? "ml";
    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <Input
                    value={amount}
                    onChange={event => onChange({ amount: event.target.value, unit })}
                    placeholder="2.5"
                    className="h-10 w-20 text-center text-base sm:text-sm"
                />
                <div className="flex-1">
                    <Combobox value={unit} onChange={nextUnit => onChange({ amount, unit: nextUnit })} options={toComboOptions(DILUENT_UNITS)} placeholder="ml" allowCustom />
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {DILUENT_PRESETS.map(preset => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => onChange({ amount: preset, unit })}
                        className={cn(
                            "px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                            amount === preset ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold" : "border-slate-200 text-slate-500 hover:bg-slate-50",
                        )}
                    >
                        {preset} ml
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onChange({ amount: "", unit })}
                    className={cn(
                        "px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer",
                        !amount ? "bg-slate-200 border-slate-300 text-slate-600 font-semibold" : "border-slate-200 text-slate-400 hover:bg-slate-50",
                    )}
                >
                    Not diluted
                </button>
            </div>
        </div>
    );
}
