import type { RxItem } from "@/types/patient";

const MEAL_TIME_LABELS: Array<[keyof RxItem["routine"], string]> = [
    ["before_breakfast", "before breakfast"],
    ["after_breakfast",  "after breakfast"],
    ["before_lunch",     "before lunch"],
    ["after_lunch",      "after lunch"],
    ["before_dinner",    "before dinner"],
    ["after_dinner",     "after dinner"],
];

export function formatMedicineRoutine(item: RxItem): string {
    const activeTimes = MEAL_TIME_LABELS
        .filter(([key]) => item.routine[key])
        .map(([, label]) => label);

    const timingPart = activeTimes.length > 0 ? activeTimes.join(", ") : "as directed";
    const parts = [item.dosage, timingPart, item.duration].filter(Boolean);
    return parts.join(" · ");
}
