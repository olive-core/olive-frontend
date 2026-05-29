import type { VitalsType } from "@/types/prescription";

const VITAL_KEYS: (keyof VitalsType)[] = [
    "bp_systolic",
    "bp_diastolic",
    "pulse",
    "temperature",
    "respiratory_rate",
    "spo2",
    "weight",
    "height",
];

export function hasAnyVital(vitals?: VitalsType | null): boolean {
    if (!vitals) return false;
    return VITAL_KEYS.some((key) => vitals[key] !== null && vitals[key] !== undefined);
}

/** Normalizes to exactly the fields the backend `on_examinations` item accepts. */
export function vitalsForSubmit(vitals?: VitalsType | null): VitalsType {
    const v = vitals ?? {};
    return {
        bp_systolic:      v.bp_systolic ?? null,
        bp_diastolic:     v.bp_diastolic ?? null,
        pulse:            v.pulse ?? null,
        temperature:      v.temperature ?? null,
        respiratory_rate: v.respiratory_rate ?? null,
        spo2:             v.spo2 ?? null,
        weight:           v.weight ?? null,
        height:           v.height ?? null,
    };
}

export function vitalsFromOnExaminations(list?: unknown[] | null): VitalsType {
    const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
    return vitalsForSubmit((first ?? {}) as VitalsType);
}

export function computeBmi(weight?: number | null, height?: number | null): number | null {
    if (!weight || !height) return null;
    const meters = height / 100;
    if (meters <= 0) return null;
    return Math.round((weight / (meters * meters)) * 10) / 10;
}

export function formatBloodPressure(systolic?: number | null, diastolic?: number | null): string | null {
    if (systolic == null && diastolic == null) return null;
    return `${systolic ?? "—"}/${diastolic ?? "—"}`;
}

/** Height is canonically stored in cm but read/entered in feet+inches in Bangladesh. */
export function cmToFeetInches(cm?: number | null): { feet: number | null; inches: number | null } {
    if (cm == null || cm <= 0) return { feet: null, inches: null };
    const totalInches = Math.round(cm / 2.54);
    return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet?: number | null, inches?: number | null): number | null {
    const ft = feet ?? 0;
    const inch = inches ?? 0;
    if (ft === 0 && inch === 0) return null;
    return Math.round((ft * 30.48 + inch * 2.54) * 10) / 10;
}

export function formatHeightImperial(cm?: number | null): string | null {
    const { feet, inches } = cmToFeetInches(cm);
    if (feet == null) return null;
    return `${feet}′${inches}″`;
}

/** Renders a day count as the most natural interval, e.g. 7 → "1 week", 90 → "3 months". */
export function formatFollowUpInterval(days?: number | null): string | null {
    if (!days || days <= 0) return null;
    if (days % 30 === 0) {
        const months = days / 30;
        return `${months} month${months > 1 ? "s" : ""}`;
    }
    if (days % 7 === 0) {
        const weeks = days / 7;
        return `${weeks} week${weeks > 1 ? "s" : ""}`;
    }
    return `${days} day${days > 1 ? "s" : ""}`;
}
