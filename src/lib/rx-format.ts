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

const FRACTION_LABELS: Record<number, string> = { 0.5: "½", 1.5: "1½", 2.5: "2½" };

export function formatCount(value?: number): string {
    if (!value) return "0";
    return FRACTION_LABELS[value] ?? String(value);
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
