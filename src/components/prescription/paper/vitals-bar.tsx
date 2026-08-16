import { useEffect, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import type { VitalsType } from "@/types/prescription";
import {
    cmToFeetInches,
    computeBmi,
    feetInchesToCm,
    formatBloodPressure,
    formatHeightImperial,
    hasAnyVital,
} from "@/lib/vitals";
import { cn } from "@/lib/utils";

interface VitalsBarProps {
    vitals: VitalsType;
    onChange?: (data: Partial<VitalsType>) => void;
}

type NumericField = {
    label: string;
    unit: string;
    key: "pulse" | "temperature" | "respiratory_rate" | "spo2" | "weight";
    step?: string;
};

const NUMERIC_FIELDS: NumericField[] = [
    { label: "Pulse",  unit: "bpm",  key: "pulse" },
    { label: "Temp",   unit: "°F",   key: "temperature", step: "0.1" },
    { label: "Resp",   unit: "/min", key: "respiratory_rate" },
    { label: "SpO₂",   unit: "%",    key: "spo2" },
    { label: "Weight", unit: "kg",   key: "weight", step: "0.1" },
];

const COMPACT_GRID = "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2";

// text-base below `sm`: iOS Safari zooms the page in on any input under 16px and never
// zooms back out. The wider cells below `sm` are what keeps 16px digits from being clipped.
const BASE_INPUT =
    "min-w-0 bg-transparent text-base sm:text-sm font-bold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function parseNum(value: string): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function nearlyEqual(a: number | null, b?: number | null): boolean {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return Math.abs(a - b) < 0.6;
}

function CellCard({ label, accent, children }: { label: string; accent?: boolean; children: ReactNode }) {
    return (
        <div
            className={cn(
                "flex flex-col gap-0.5 rounded-md border px-2 py-1.5 transition-all focus-within:border-emerald-400 focus-within:shadow-sm",
                accent ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">{label}</span>
            <div className="flex items-baseline gap-1">{children}</div>
        </div>
    );
}

function Unit({ children }: { children: ReactNode }) {
    return <span className="text-[10px] font-medium text-slate-900">{children}</span>;
}

function HeightCell({ cm, onChange }: { cm?: number | null; onChange: (cm: number | null) => void }) {
    const initial = cmToFeetInches(cm);
    const [feet, setFeet] = useState(initial.feet?.toString() ?? "");
    const [inches, setInches] = useState(initial.inches?.toString() ?? "");

    useEffect(() => {
        const localCm = feetInchesToCm(parseNum(feet), parseNum(inches));
        if (!nearlyEqual(localCm, cm)) {
            const next = cmToFeetInches(cm);
            setFeet(next.feet?.toString() ?? "");
            setInches(next.inches?.toString() ?? "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cm]);

    const commit = (nextFeet: string, nextInches: string) =>
        onChange(feetInchesToCm(parseNum(nextFeet), parseNum(nextInches)));

    return (
        <CellCard label="Height">
            <input
                className={cn(BASE_INPUT, "w-9 sm:w-7 text-center")}
                type="number"
                inputMode="numeric"
                placeholder="—"
                value={feet}
                onChange={(e) => {
                    setFeet(e.target.value);
                    commit(e.target.value, inches);
                }}
            />
            <Unit>ft</Unit>
            <input
                className={cn(BASE_INPUT, "w-9 sm:w-7 text-center")}
                type="number"
                inputMode="numeric"
                placeholder="—"
                value={inches}
                onChange={(e) => {
                    setInches(e.target.value);
                    commit(feet, e.target.value);
                }}
            />
            <Unit>in</Unit>
        </CellCard>
    );
}

function EditableVitals({ vitals, onChange }: Required<VitalsBarProps>) {
    const bmi = computeBmi(vitals.weight, vitals.height);

    return (
        <div className={COMPACT_GRID}>
            <CellCard label="BP">
                <input
                    className={cn(BASE_INPUT, "w-10 sm:w-8")}
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={vitals.bp_systolic ?? ""}
                    onChange={(e) => onChange({ bp_systolic: parseNum(e.target.value) })}
                />
                <span className="text-slate-300 text-sm">/</span>
                <input
                    className={cn(BASE_INPUT, "w-10 sm:w-8")}
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={vitals.bp_diastolic ?? ""}
                    onChange={(e) => onChange({ bp_diastolic: parseNum(e.target.value) })}
                />
                <Unit>mmHg</Unit>
            </CellCard>

            {NUMERIC_FIELDS.map((field) => (
                <CellCard key={field.key} label={field.label}>
                    <input
                        className={cn(BASE_INPUT, "w-full")}
                        type="number"
                        inputMode="decimal"
                        step={field.step}
                        placeholder="—"
                        value={vitals[field.key] ?? ""}
                        onChange={(e) => onChange({ [field.key]: parseNum(e.target.value) })}
                    />
                    <Unit>{field.unit}</Unit>
                </CellCard>
            ))}

            <HeightCell cm={vitals.height} onChange={(cm) => onChange({ height: cm })} />

            <CellCard label="BMI" accent>
                <span className="text-sm font-bold text-emerald-700">{bmi ?? "—"}</span>
                {bmi !== null && <Unit>kg/m²</Unit>}
            </CellCard>
        </div>
    );
}

// Eight vital cells cost roughly a third of a phone screen, above the prescription and
// before anything the clinician came to write. Folded away they cost one line, and what is
// already filled in still reads at a glance. The desktop grid is untouched — it opens from
// `sm` up regardless of this toggle.
function EditableVitalsSection({ vitals, onChange }: Required<VitalsBarProps>) {
    const [isOpenOnPhone, setIsOpenOnPhone] = useState(false);
    const isFilled = hasAnyVital(vitals);

    return (
        <div className="flex flex-col gap-2 border-y py-2.5">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">On Examination</h3>
                <button
                    type="button"
                    aria-expanded={isOpenOnPhone}
                    onClick={() => setIsOpenOnPhone((open) => !open)}
                    className="flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-bold text-emerald-600 sm:hidden"
                >
                    {isOpenOnPhone ? "Done" : isFilled ? "Edit" : "Add vitals"}
                    <ChevronDownIcon aria-hidden className={cn("size-3.5 transition-transform", isOpenOnPhone && "rotate-180")} />
                </button>
            </div>

            {!isOpenOnPhone && isFilled && (
                <div className="sm:hidden">
                    <ReadOnlyVitals vitals={vitals} />
                </div>
            )}

            <div className={cn(isOpenOnPhone ? "block" : "hidden", "sm:block")}>
                <EditableVitals vitals={vitals} onChange={onChange} />
            </div>
        </div>
    );
}

interface VitalChip {
    label: string;
    value: string;
    unit?: string;
    accent?: boolean;
}

function ReadOnlyVitals({ vitals }: { vitals: VitalsType }) {
    const bp = formatBloodPressure(vitals.bp_systolic, vitals.bp_diastolic);
    const height = formatHeightImperial(vitals.height);
    const bmi = computeBmi(vitals.weight, vitals.height);

    const chips: VitalChip[] = [];
    if (bp)                            chips.push({ label: "BP",    value: bp,                       unit: "mmHg" });
    if (vitals.pulse != null)          chips.push({ label: "Pulse", value: String(vitals.pulse),     unit: "bpm" });
    if (vitals.temperature != null)    chips.push({ label: "Temp",  value: String(vitals.temperature), unit: "°F" });
    if (vitals.respiratory_rate != null) chips.push({ label: "RR",  value: String(vitals.respiratory_rate), unit: "/min" });
    if (vitals.spo2 != null)           chips.push({ label: "SpO₂",  value: String(vitals.spo2),      unit: "%" });
    if (vitals.weight != null)         chips.push({ label: "Wt",    value: String(vitals.weight),    unit: "kg" });
    if (height)                        chips.push({ label: "Ht",    value: height });
    if (bmi !== null)                  chips.push({ label: "BMI",   value: String(bmi),              unit: "kg/m²", accent: true });

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {chips.map((chip, i) => (
                <span key={i} className="inline-flex items-baseline gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">{chip.label}</span>
                    <span className={cn("text-xs font-semibold", chip.accent ? "text-emerald-700" : "text-slate-900")}>
                        {chip.value}
                    </span>
                    {chip.unit && <span className="text-[10px] text-slate-900">{chip.unit}</span>}
                </span>
            ))}
        </div>
    );
}

export default function VitalsBar({ vitals, onChange }: VitalsBarProps) {
    const isEditable = onChange !== undefined;

    if (!isEditable && !hasAnyVital(vitals)) return null;

    if (isEditable) return <EditableVitalsSection vitals={vitals} onChange={onChange} />;

    return (
        <div className="flex items-baseline gap-3 border-y py-2">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-900">On Exam</span>
            <ReadOnlyVitals vitals={vitals} />
        </div>
    );
}
