import { DURATION_PRESETS, FREQUENCIES, SITES, expandCode, type RxOption } from "@/constants/prescription";
import type { MedicineCategory } from "@/lib/dosage-form";
import type { MedicineDuration, MedicineSchedule, MeedicineType } from "@/types/prescription";

type Routine = MeedicineType["routine"];

const TIMING_WORDS: Record<string, string> = {
    before: "before meal",
    after: "after meal",
    with: "with meal",
    empty: "on an empty stomach",
    bedtime: "at bedtime",
};

const FRACTION_GLYPHS: { value: number; glyph: string }[] = [
    { value: 1 / 4, glyph: "¼" },
    { value: 1 / 3, glyph: "⅓" },
    { value: 1 / 2, glyph: "½" },
    { value: 2 / 3, glyph: "⅔" },
    { value: 3 / 4, glyph: "¾" },
];
const GLYPH_VALUES: Record<string, number> = { "¼": 0.25, "⅓": 1 / 3, "½": 0.5, "⅔": 2 / 3, "¾": 0.75 };
const FRACTION_TOLERANCE = 0.04;

// Renders a count as a doctor-friendly mixed fraction: 0.5 → "½", 1.25 → "1¼", 1.5 → "1½".
// Uncommon values that don't sit near a known fraction fall back to a trimmed decimal.
export function toFractionLabel(value?: number): string {
    if (!value) return "0";
    const whole = Math.floor(value);
    const frac = value - whole;
    if (frac < FRACTION_TOLERANCE) return String(whole);
    const match = FRACTION_GLYPHS.find(option => Math.abs(frac - option.value) < FRACTION_TOLERANCE);
    if (!match) return String(Math.round(value * 100) / 100);
    return whole === 0 ? match.glyph : `${whole}${match.glyph}`;
}

// Parses a single count token — glyph ("1½", "½"), ascii fraction ("1 1/2", "1/2") or decimal ("1.5").
export function parseFraction(token: string): number {
    const text = token.trim();
    if (!text) return 0;
    const glyphMatch = text.match(/^(\d*)\s*([¼⅓½⅔¾])$/);
    if (glyphMatch) return (glyphMatch[1] ? Number(glyphMatch[1]) : 0) + GLYPH_VALUES[glyphMatch[2]];
    const asciiMatch = text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
    if (asciiMatch) return (asciiMatch[1] ? Number(asciiMatch[1]) : 0) + Number(asciiMatch[2]) / Number(asciiMatch[3]);
    const num = Number(text);
    return Number.isNaN(num) ? 0 : num;
}

// "1.5+0+1¼" → { morning: 1.5, noon: 0, night: 1.25 } for the editable meal-pattern box.
export function parseMealPattern(text: string): Pick<MedicineSchedule, "morning" | "noon" | "night"> {
    const parts = text.split("+");
    return { morning: parseFraction(parts[0] ?? ""), noon: parseFraction(parts[1] ?? ""), night: parseFraction(parts[2] ?? "") };
}

export function formatCount(value?: number): string {
    return toFractionLabel(value);
}

function mealPattern(morning?: number, noon?: number, night?: number): string {
    return `${formatCount(morning)}+${formatCount(noon)}+${formatCount(night)}`;
}

function withTiming(base: string, timing?: string): string {
    return timing && TIMING_WORDS[timing] ? `${base}, ${TIMING_WORDS[timing]}` : base;
}

// The single place a frequency is turned into a patient-readable string (counts + full forms).
export function formatSchedule(schedule?: MedicineSchedule, routineFallback?: Routine): string {
    if (schedule) {
        if (schedule.morning || schedule.noon || schedule.night) {
            return withTiming(mealPattern(schedule.morning, schedule.noon, schedule.night), schedule.timing);
        }
        if (schedule.gapHours) return `Every ${schedule.gapHours} hours`;
        if (schedule.code) return withTiming(expandCode(schedule.code, FREQUENCIES), schedule.timing);
    }
    return routineFallback ? formatRoutineBooleans(routineFallback) : "";
}

function formatRoutineBooleans(routine: Routine): string {
    if (routine.gapHours) return `Every ${routine.gapHours} hours`;
    const morning = routine.beforeBreakfast || routine.afterBreakfast ? 1 : 0;
    const noon = routine.beforeLunch || routine.afterLunch ? 1 : 0;
    const night = routine.beforeDinner || routine.afterDinner ? 1 : 0;
    if (morning + noon + night === 0) return "";
    const before = routine.beforeBreakfast || routine.beforeLunch || routine.beforeDinner;
    const after = routine.afterBreakfast || routine.afterLunch || routine.afterDinner;
    const timing = before && !after ? "before" : after && !before ? "after" : undefined;
    return withTiming(`${morning}+${noon}+${night}`, timing);
}

export function formatDuration(duration?: MedicineDuration): string {
    if (!duration) return "";
    if (duration.preset) return expandCode(duration.preset, DURATION_PRESETS);
    if (duration.value != null && duration.unit) return `${duration.value} ${duration.unit}`;
    return "";
}

// Counts/timing → the legacy boolean routine the backend and older views still read.
export function routineFromSchedule(schedule?: MedicineSchedule): Routine {
    if (!schedule) return {};
    if (schedule.gapHours) return { gapHours: schedule.gapHours };
    const before = schedule.timing === "before";
    return {
        beforeBreakfast: before && !!schedule.morning,
        afterBreakfast: !before && !!schedule.morning,
        beforeLunch: before && !!schedule.noon,
        afterLunch: !before && !!schedule.noon,
        beforeDinner: before && !!schedule.night,
        afterDinner: !before && !!schedule.night,
    };
}

// Boolean routine → schedule, so AI- / legacy-sourced medicines open in the structured editor.
export function scheduleFromRoutine(routine?: Routine): MedicineSchedule {
    if (!routine) return {};
    if (routine.gapHours) return { gapHours: routine.gapHours };
    const before = routine.beforeBreakfast || routine.beforeLunch || routine.beforeDinner;
    return {
        timing: before ? "before" : "after",
        morning: routine.beforeBreakfast || routine.afterBreakfast ? 1 : 0,
        noon: routine.beforeLunch || routine.afterLunch ? 1 : 0,
        night: routine.beforeDinner || routine.afterDinner ? 1 : 0,
    };
}

// Read the snake-cased saved/stored rx item (used by the read mapper and A4 print views).
export function scheduleFromStored(item: Record<string, any>): MedicineSchedule {
    const stored = item?.schedule;
    if (stored) {
        return {
            timing: stored.timing,
            morning: stored.morning,
            noon: stored.noon,
            night: stored.night,
            gapHours: stored.gap_hours,
            code: stored.code,
        };
    }
    const routine = item?.routine;
    if (!routine) return {};
    return scheduleFromRoutine({
        beforeBreakfast: routine.before_breakfast,
        afterBreakfast: routine.after_breakfast,
        beforeLunch: routine.before_lunch,
        afterLunch: routine.after_lunch,
        beforeDinner: routine.before_dinner,
        afterDinner: routine.after_dinner,
        gapHours: routine.gap_hour,
    });
}

export function formatStoredFrequency(item: Record<string, any>): string {
    return formatSchedule(scheduleFromStored(item));
}

export function formatStoredDuration(item: Record<string, any>): string {
    if (item?.duration_preset) return expandCode(item.duration_preset, DURATION_PRESETS);
    if (item?.duration_value != null && item?.duration_unit) return `${item.duration_value} ${item.duration_unit}`;
    return item?.duration || "";
}

const SITE_CODES_BY_CATEGORY: Partial<Record<MedicineCategory, string[]>> = {
    eye_drops: ["O/E", "R/E", "L/E"],
    eye_ointment: ["O/E", "R/E", "L/E"],
    ear_drops: ["R/Ear", "L/Ear", "Both ears"],
    nasal_drops: ["Each nostril"],
    nasal_spray: ["Each nostril"],
    spray: ["Each nostril", "Sublingual", "Throat"],
    drops: ["O/E", "R/E", "L/E", "R/Ear", "L/Ear", "Both ears", "Each nostril"],
    ointment: ["Affected area"],
    cream: ["Affected area"],
    gel: ["Affected area"],
    lotion: ["Affected area"],
    transdermal_patch: ["Affected area"],
};

export function getSiteOptions(category?: MedicineCategory): RxOption[] {
    const codes = category ? SITE_CODES_BY_CATEGORY[category] : undefined;
    return codes ? SITES.filter(site => codes.includes(site.code)) : [...SITES];
}
