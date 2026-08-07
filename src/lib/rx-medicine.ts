import type { MeedicineType } from "@/types/prescription";
import { composeDose, composeDuration } from "@/lib/rx-compose";
import { scheduleFromStored } from "@/lib/rx-format";

type StoredRoutine = {
    before_breakfast: boolean;
    after_breakfast: boolean;
    before_lunch: boolean;
    after_lunch: boolean;
    before_dinner: boolean;
    after_dinner: boolean;
    gap_hour: number;
};

type StoredSchedule = {
    timing: string | null;
    morning: number | null;
    noon: number | null;
    night: number | null;
    gap_hours: number | null;
    code: string | null;
};

// The persisted medicine shape — mirrors the backend `RxItem`. A prescription and a memory
// both serialize to this, so a medicine reloads identically from either source.
export interface StoredRxItem {
    medicine_id: string | null;
    trade_name: string;
    generic_name: string;
    dosage: string;
    duration: string;
    routine: StoredRoutine;
    dosage_form: string | null;
    type: string | null;
    route: string | null;
    site: string | null;
    dose: MeedicineType["dose"] | null;
    schedule: StoredSchedule | null;
    frequency_code: string | null;
    duration_value: number | null;
    duration_unit: string | null;
    duration_preset: string | null;
    instructions: string | null;
}

export function serializeMedicine(item: MeedicineType): StoredRxItem {
    return {
        medicine_id: null,
        trade_name: item.trade_name || item.value,
        generic_name: item.generic_name || item.value,
        dosage: item.dosage || composeDose(item),
        duration: composeDuration(item),
        routine: serializeRoutine(item.routine),
        dosage_form: item.dosage_form ?? null,
        type: item.type ?? null,
        route: item.route ?? null,
        site: item.site ?? null,
        dose: item.dose ?? null,
        schedule: serializeSchedule(item.schedule),
        frequency_code: item.schedule?.code ?? item.frequencyCode ?? null,
        duration_value: item.duration?.value ?? null,
        duration_unit: item.duration?.unit ?? null,
        duration_preset: item.duration?.preset ?? null,
        instructions: item.instructions ?? null,
    };
}

export function deserializeMedicine(item: StoredRxItem): MeedicineType {
    const name = item.trade_name || item.generic_name || "";
    return {
        name,
        value: name,
        trade_name: item.trade_name || undefined,
        generic_name: item.generic_name || undefined,
        type: (item.type ?? undefined) as MeedicineType["type"],
        dosage_form: item.dosage_form ?? undefined,
        route: item.route ?? undefined,
        site: item.site ?? undefined,
        dose: item.dose ?? undefined,
        instructions: item.instructions ?? undefined,
        frequencyCode: item.frequency_code ?? undefined,
        dosage: item.dosage,
        duration: durationFromStored(item),
        schedule: scheduleFromStored(item),
        routine: deserializeRoutine(item.routine),
    };
}

function serializeSchedule(schedule: MeedicineType["schedule"]): StoredSchedule | null {
    if (!schedule) return null;
    return {
        timing: schedule.timing ?? null,
        morning: schedule.morning ?? null,
        noon: schedule.noon ?? null,
        night: schedule.night ?? null,
        gap_hours: schedule.gapHours ?? null,
        code: schedule.code ?? null,
    };
}

function durationFromStored(item: StoredRxItem): MeedicineType["duration"] {
    if (item.duration_preset) return { preset: item.duration_preset };
    if (item.duration_value != null && item.duration_unit) {
        return { value: item.duration_value, unit: item.duration_unit };
    }
    return {};
}

function serializeRoutine(routine?: MeedicineType["routine"]): StoredRoutine {
    return {
        before_breakfast: routine?.beforeBreakfast || false,
        after_breakfast: routine?.afterBreakfast || false,
        before_lunch: routine?.beforeLunch || false,
        after_lunch: routine?.afterLunch || false,
        before_dinner: routine?.beforeDinner || false,
        after_dinner: routine?.afterDinner || false,
        gap_hour: routine?.gapHours || 0,
    };
}

function deserializeRoutine(routine?: StoredRoutine): MeedicineType["routine"] {
    return {
        beforeBreakfast: routine?.before_breakfast || false,
        afterBreakfast: routine?.after_breakfast || false,
        beforeLunch: routine?.before_lunch || false,
        afterLunch: routine?.after_lunch || false,
        beforeDinner: routine?.before_dinner || false,
        afterDinner: routine?.after_dinner || false,
        gapHours: routine?.gap_hour || 0,
    };
}
