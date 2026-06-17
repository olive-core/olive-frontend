import type { ArchetypeKey } from "@/lib/dosage-form";
import {
    DROP_DOSE_UNITS,
    INHALER_DOSE_UNITS,
    INJECTION_DOSE_UNITS,
    LIQUID_DOSE_UNITS,
    SPRAY_DOSE_UNITS,
    VOLUME_DOSE_UNITS,
    type RxOption,
} from "@/constants/prescription";

// `in_pattern` = the count lives in the meal pattern (3+3+3), no separate dose field.
// `explicit`   = an amount + unit field (1 TSF, 1 Vial).
// `none`       = no dose count (topicals — "apply").
export type DoseMode = "in_pattern" | "explicit" | "none";

// `meal` = Before/After toggle + per-meal count cells. `code` = OD/BD/TDS/Stat... chips + interval.
export type FrequencyMode = "meal" | "code";

export type RxTypeConfig = {
    doseMode: DoseMode;
    frequencyMode: FrequencyMode;
    showRoute: boolean;
    showSite: boolean;        // site options are derived from the category (getSiteOptions)
    showMealTiming: boolean;  // a before/after-meal field for code-mode oral types
    units?: readonly RxOption[];
    instructions: string[];
};

// THE place to tune which fields each medicine type shows and how dose/frequency behave.
export const RX_TYPE_CONFIG: Record<ArchetypeKey, RxTypeConfig> = {
    oral_solid: {
        doseMode: "in_pattern", frequencyMode: "meal", showRoute: false, showSite: false, showMealTiming: false,
        instructions: ["After meal", "Take on an empty stomach", "Complete the full course", "Do not crush or chew"],
    },
    oral_liquid: {
        doseMode: "explicit", units: LIQUID_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: false, showMealTiming: true,
        instructions: ["Shake well before use", "After meal", "Complete the full course"],
    },
    injection: {
        doseMode: "explicit", units: INJECTION_DOSE_UNITS, frequencyMode: "code", showRoute: true, showSite: false, showMealTiming: false,
        instructions: ["Reconstitute before use", "Give slowly", "Rotate injection/patch sites"],
    },
    iv_fluid: {
        doseMode: "explicit", units: VOLUME_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: false, showMealTiming: false,
        instructions: ["Infuse over 4 hours", "Infuse over 6 hours", "Infuse over 8 hours", "With cardiac monitoring"],
    },
    drops: {
        doseMode: "explicit", units: DROP_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: true, showMealTiming: false,
        instructions: [],
    },
    spray: {
        doseMode: "explicit", units: SPRAY_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: true, showMealTiming: false,
        instructions: ["Prime before first use", "Max 3 sprays in 15 min"],
    },
    inhaler: {
        doseMode: "explicit", units: INHALER_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: false, showMealTiming: false,
        instructions: ["Rinse mouth with water after use", "Use spacer when possible"],
    },
    nebulizer: {
        doseMode: "explicit", units: DROP_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: false, showMealTiming: false,
        instructions: ["Dilute in 2.5 ml normal saline", "Via nebulizer"],
    },
    topical: {
        doseMode: "none", frequencyMode: "code", showRoute: false, showSite: true, showMealTiming: false,
        instructions: ["Apply thinly / Apply sparingly", "Apply to affected area", "Avoid sun exposure"],
    },
    insert: {
        doseMode: "explicit", frequencyMode: "code", showRoute: true, showSite: false, showMealTiming: false,
        instructions: ["Insert high into vagina", "Retain as long as possible", "At bedtime"],
    },
    sachet: {
        doseMode: "explicit", units: VOLUME_DOSE_UNITS, frequencyMode: "code", showRoute: false, showSite: false, showMealTiming: true,
        instructions: ["Dissolve in half a glass of water", "Mix in 500 ml of clean water", "After each loose stool"],
    },
    patch: {
        doseMode: "explicit", frequencyMode: "code", showRoute: false, showSite: true, showMealTiming: false,
        instructions: ["Rotate injection/patch sites", "Remove old patch before applying new one"],
    },
    mouthwash: {
        doseMode: "explicit", frequencyMode: "code", showRoute: false, showSite: false, showMealTiming: false,
        instructions: ["Rinse for 30 seconds then spit out", "Do not eat or drink for 30 min after"],
    },
    generic: {
        doseMode: "explicit", frequencyMode: "code", showRoute: true, showSite: false, showMealTiming: true,
        instructions: [],
    },
};
