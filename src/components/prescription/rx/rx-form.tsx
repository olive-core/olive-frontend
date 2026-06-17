import { CalendarDays, Crosshair, Info, PillIcon, Repeat, Route as RouteIcon, Utensils } from "lucide-react";
import RxField from "./rx-field";
import DoseInput from "./dose-input";
import SuggestInput from "./suggest-input";
import FrequencyPicker from "./frequency-picker";
import DurationInput from "./duration-input";
import InstructionsInput from "./instructions-input";
import { cn } from "@/lib/utils";
import { INJECTION_ROUTES, ROUTES } from "@/constants/prescription";
import { getSiteOptions } from "@/lib/rx-format";
import type { MedicineCategory } from "@/lib/dosage-form";
import type { MedicineSchedule, MeedicineType } from "@/types/prescription";
import type { RxTypeConfig } from "./rx-type-config";

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
                    <SuggestInput value={medicine.route ?? ""} onChange={route => onChange({ route })} options={routeOptions(medicine.type)} placeholder="I/V, I/M, P/R..." />
                </RxField>
            )}

            {config.doseMode === "explicit" && (
                <RxField label="Dose" icon={<PillIcon size={12} />}>
                    <DoseInput dose={medicine.dose} onChange={dose => onChange({ dose })} unitOptions={config.units} />
                </RxField>
            )}

            <RxField label="Frequency" icon={<Repeat size={12} />}>
                <FrequencyPicker schedule={schedule} mode={config.frequencyMode} onChange={setSchedule} />
            </RxField>

            {config.showSite && (
                <RxField label="Site" icon={<Crosshair size={12} />}>
                    <SuggestInput value={medicine.site ?? ""} onChange={site => onChange({ site })} options={getSiteOptions(medicine.type)} placeholder="Affected area / which eye, ear..." />
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
                <InstructionsInput value={medicine.instructions ?? ""} onChange={instructions => onChange({ instructions })} suggestions={config.instructions} />
            </RxField>
        </div>
    );
}
