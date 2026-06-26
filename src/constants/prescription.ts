// Static option sets for the prescription Rx editor, drawn from the Bangladesh/global
// prescription guide. Every option carries a short `code` (what the doctor types/picks)
// and a `fullForm` (expanded for the patient on the printed prescription).

export type RxOption = {
    code: string;
    fullForm: string;
};

// The frequency codes the picker can produce: `code` mode shows them as chips, `meal` mode
// reuses OD/BD/TDS/HS. expandCode() turns a saved code into its patient-facing full form.
export const FREQUENCIES: readonly RxOption[] = [
    { code: "OD", fullForm: "once daily" },
    { code: "BD", fullForm: "twice daily" },
    { code: "TDS", fullForm: "three times daily" },
    { code: "QDS", fullForm: "four times daily" },
    { code: "Q6H", fullForm: "every 6 hours" },
    { code: "Q8H", fullForm: "every 8 hours" },
    { code: "Q12H", fullForm: "every 12 hours" },
    { code: "HS", fullForm: "at bedtime" },
    { code: "SOS", fullForm: "when necessary" },
    { code: "Stat", fullForm: "immediately" },
];

export const ROUTES: readonly RxOption[] = [
    { code: "P/O", fullForm: "by mouth" },
    { code: "I/V", fullForm: "intravenous" },
    { code: "I/M", fullForm: "intramuscular" },
    { code: "S/C", fullForm: "subcutaneous" },
    { code: "I/D", fullForm: "intradermal" },
    { code: "S/L", fullForm: "sublingual" },
    { code: "Buccal", fullForm: "between cheek and gum" },
    { code: "P/R", fullForm: "per rectum" },
    { code: "P/V", fullForm: "per vaginum" },
    { code: "Top.", fullForm: "topical" },
    { code: "Inh.", fullForm: "inhalation" },
    { code: "Neb.", fullForm: "nebulization" },
    { code: "Nasal", fullForm: "via the nose" },
    { code: "Ophthalmic", fullForm: "into the eye" },
    { code: "Otic", fullForm: "into the ear" },
    { code: "Transdermal", fullForm: "through the skin" },
    { code: "I/A", fullForm: "intra-articular" },
    { code: "I/T", fullForm: "intrathecal" },
];

export const DOSE_UNITS: readonly RxOption[] = [
    { code: "tablet", fullForm: "tablet" },
    { code: "capsule", fullForm: "capsule" },
    { code: "TSF", fullForm: "teaspoon" },
    { code: "DTSF", fullForm: "dessertspoon" },
    { code: "BSF", fullForm: "tablespoon" },
    { code: "tbsp", fullForm: "tablespoon" },
    { code: "ml", fullForm: "millilitre" },
    { code: "drops", fullForm: "drops" },
    { code: "puff", fullForm: "puff" },
    { code: "spray", fullForm: "spray" },
    { code: "Vial", fullForm: "vial" },
    { code: "Amp", fullForm: "ampoule" },
    { code: "Sachet", fullForm: "sachet" },
    { code: "Stick", fullForm: "suppository" },
    { code: "Pessary", fullForm: "pessary" },
    { code: "Applicatorful", fullForm: "applicatorful" },
    { code: "Patch", fullForm: "patch" },
    { code: "Unit", fullForm: "unit" },
    { code: "mg", fullForm: "milligram" },
    { code: "IU", fullForm: "international units" },
    { code: "mEq", fullForm: "milliequivalents" },
];

export const SITES: readonly RxOption[] = [
    { code: "O/E", fullForm: "both eyes" },
    { code: "R/E", fullForm: "right eye" },
    { code: "L/E", fullForm: "left eye" },
    { code: "R/Ear", fullForm: "right ear" },
    { code: "L/Ear", fullForm: "left ear" },
    { code: "Both ears", fullForm: "both ears" },
    { code: "Each nostril", fullForm: "each nostril" },
    { code: "Sublingual", fullForm: "under the tongue" },
    { code: "Throat", fullForm: "throat" },
    { code: "Affected area", fullForm: "affected area" },
];

export const DURATION_UNITS: readonly RxOption[] = [
    { code: "Days", fullForm: "days" },
    { code: "Weeks", fullForm: "weeks" },
    { code: "Months", fullForm: "months" },
];

export const DURATION_PRESETS: readonly RxOption[] = [
    { code: "Continue", fullForm: "ongoing, no fixed end" },
    { code: "Till Review", fullForm: "until next appointment" },
    { code: "Stat", fullForm: "one-time immediate dose" },
    { code: "SOS", fullForm: "only when needed" },
];

const pickUnits = (...codes: string[]): RxOption[] =>
    codes.map(code => DOSE_UNITS.find(unit => unit.code === code)).filter((u): u is RxOption => Boolean(u));

// Curated unit / route subsets so each archetype form offers only what's relevant.
export const LIQUID_DOSE_UNITS = pickUnits("TSF", "BSF", "ml", "drops");
export const INJECTION_DOSE_UNITS = pickUnits("Vial", "Amp", "ml", "mg", "Unit", "IU");
export const DROP_DOSE_UNITS = pickUnits("drops", "ml");
export const SPRAY_DOSE_UNITS = pickUnits("spray");
export const INHALER_DOSE_UNITS = pickUnits("puff");
export const VOLUME_DOSE_UNITS = pickUnits("ml", "Sachet");
export const DILUENT_UNITS = pickUnits("ml");
export const INJECTION_ROUTES = ROUTES.filter(route => ["I/V", "I/M", "S/C", "I/D", "I/A"].includes(route.code));

const findOption = (code: string, options: readonly RxOption[]): RxOption | undefined =>
    options.find(option => option.code.toLowerCase() === code.toLowerCase());

// Renders "code (full form)" for the patient, e.g. "TSF (teaspoon)". Falls back to the
// bare code when there is no expansion or the full form merely repeats the code.
export function expandCode(code: string | undefined | null, options: readonly RxOption[]): string {
    if (!code) return "";
    const match = findOption(code, options);
    if (!match || !match.fullForm || match.fullForm.toLowerCase() === match.code.toLowerCase()) {
        return code;
    }
    return `${match.code} (${match.fullForm})`;
}

export const getFrequency = (code: string): RxOption | undefined => findOption(code, FREQUENCIES);
