import { useEffect, useState, type ReactNode } from "react";

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

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5";

const BASE_INPUT =
    "min-w-0 bg-transparent text-[16px] font-bold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

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
                "flex flex-col gap-0.5 rounded-xl border px-3 py-2 transition-all focus-within:border-emerald-400 focus-within:shadow-sm",
                accent ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <div className="flex items-baseline gap-1">{children}</div>
        </div>
    );
}

function Unit({ children }: { children: ReactNode }) {
    return <span className="text-[11px] font-medium text-slate-400">{children}</span>;
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
                className={cn(BASE_INPUT, "w-8 text-center")}
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
                className={cn(BASE_INPUT, "w-8 text-center")}
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
        <div className={GRID}>
            <CellCard label="BP">
                <input
                    className={cn(BASE_INPUT, "w-9")}
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={vitals.bp_systolic ?? ""}
                    onChange={(e) => onChange({ bp_systolic: parseNum(e.target.value) })}
                />
                <span className="text-slate-300">/</span>
                <input
                    className={cn(BASE_INPUT, "w-9")}
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
                <span className="text-[16px] font-bold text-emerald-700">{bmi ?? "—"}</span>
                {bmi !== null && <Unit>kg/m²</Unit>}
            </CellCard>
        </div>
    );
}

function ReadCell({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
    return (
        <div
            className={cn(
                "flex flex-col gap-0.5 rounded-xl border px-3 py-2",
                accent ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-slate-50/60"
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={cn("text-[16px] font-bold", accent ? "text-emerald-700" : "text-slate-800")}>{value}</span>
                {unit && <Unit>{unit}</Unit>}
            </div>
        </div>
    );
}

function ReadOnlyVitals({ vitals }: { vitals: VitalsType }) {
    const bp = formatBloodPressure(vitals.bp_systolic, vitals.bp_diastolic);
    const height = formatHeightImperial(vitals.height);
    const bmi = computeBmi(vitals.weight, vitals.height);

    return (
        <div className={GRID}>
            {bp && <ReadCell label="BP" value={bp} unit="mmHg" />}
            {NUMERIC_FIELDS.map((field) =>
                vitals[field.key] != null ? (
                    <ReadCell key={field.key} label={field.label} value={String(vitals[field.key])} unit={field.unit} />
                ) : null
            )}
            {height && <ReadCell label="Height" value={height} />}
            {bmi !== null && <ReadCell label="BMI" value={String(bmi)} unit="kg/m²" accent />}
        </div>
    );
}

export default function VitalsBar({ vitals, onChange }: VitalsBarProps) {
    const isEditable = onChange !== undefined;

    if (!isEditable && !hasAnyVital(vitals)) return null;

    return (
        <div className="flex flex-col gap-2.5 border-y py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">On Examination</h3>
            {isEditable ? <EditableVitals vitals={vitals} onChange={onChange} /> : <ReadOnlyVitals vitals={vitals} />}
        </div>
    );
}
