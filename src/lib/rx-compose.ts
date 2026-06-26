import type { MedicineDuration, MeedicineType } from "@/types/prescription";
import { DOSE_UNITS, DURATION_PRESETS, ROUTES, SITES, expandCode } from "@/constants/prescription";
import { parseFraction, toFractionLabel } from "@/lib/rx-format";

// Numeric amounts ("1.5", "½") print as mixed fractions ("1½"); ranges / free text ("1-2") pass through.
function formatAmount(amount: string): string {
    const value = parseFraction(amount);
    return value ? toFractionLabel(value) : amount;
}

// Builds the human-readable `dosage` / `duration` strings from the structured fields.
// Abbreviations are expanded for the patient ("1 TSF (teaspoon), I/V (intravenous)"), and
// these strings keep the backend RxItem and the A4 print views working unchanged.

// Routes implied by the medicine type (and the site) add no information on the printed
// line, so they're hidden; only clinically meaningful routes (I/V, S/L, P/R...) are shown.
const IMPLIED_ROUTES = new Set(["P/O", "Ophthalmic", "Otic", "Nasal", "Top.", "Inh.", "Neb.", "Transdermal"]);

export function composeDose(medicine: Pick<MeedicineType, "dose" | "route" | "site">): string {
    const amount = medicine.dose?.amount?.trim();
    const unit = medicine.dose?.unit?.trim();
    const diluentAmount = medicine.dose?.diluent?.amount?.trim();
    // A unit without an amount carries no information (e.g. oral solids count via the schedule).
    const doseText = amount ? [formatAmount(amount), unit ? expandCode(unit, DOSE_UNITS) : ""].filter(Boolean).join(" ") : "";
    // An empty / zero diluent volume means the medicine is given undiluted.
    const dilutedText = diluentAmount && parseFraction(diluentAmount) > 0
        ? [doseText, `diluted in ${diluentAmount} ${medicine.dose?.diluent?.unit ?? "ml"} normal saline`].filter(Boolean).join(" ")
        : doseText;
    const route = medicine.route && !IMPLIED_ROUTES.has(medicine.route) ? expandCode(medicine.route, ROUTES) : "";
    const site = medicine.site ? expandCode(medicine.site, SITES) : "";
    return [dilutedText, route, site].filter(Boolean).join(", ");
}

export function composeDuration(medicine: Pick<MeedicineType, "duration">): string {
    const duration = medicine.duration;
    if (!duration) return "";
    if (duration.preset) return duration.preset;
    if (duration.value != null && duration.unit) return `${duration.value} ${duration.unit}`;
    return "";
}

const DURATION_UNIT_BY_WORD: Record<string, string> = { day: "Days", week: "Weeks", month: "Months" };

// Parses a free-text duration ("5 Days", "Continue") into the structured shape so an
// AI- or template-sourced medicine can still be edited with the structured controls.
export function parseDuration(raw?: string | null): MedicineDuration {
    if (!raw) return {};
    const text = raw.trim();
    const match = text.match(/^(\d+)\s*(day|week|month)s?\b/i);
    if (match) {
        return { value: Number(match[1]), unit: DURATION_UNIT_BY_WORD[match[2].toLowerCase()] };
    }
    const preset = DURATION_PRESETS.find(option => option.code.toLowerCase() === text.toLowerCase());
    return { preset: preset ? preset.code : text };
}
