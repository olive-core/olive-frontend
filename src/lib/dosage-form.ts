// Maps the raw `dosage_form` values from the medicine table (148+ distinct strings,
// many of which differ only by release qualifiers like "ER Tablet" vs "Tablet") down to
// a small set of canonical categories, and from there to the input archetype that decides
// which editor interface is shown. Kept free of component imports so the registry can
// depend on it without a cycle.

export type MedicineCategory =
    | "tablet" | "capsule" | "sublingual_tab" | "buccal_tab" | "lozenge"
    | "syrup" | "suspension" | "oral_solution" | "oral_drops" | "elixir"
    | "injection" | "iv_fluid"
    | "eye_drops" | "ear_drops" | "nasal_drops" | "drops"
    | "nasal_spray" | "gtn_spray" | "spray"
    | "inhaler" | "nebulizer"
    | "ointment" | "cream" | "gel" | "lotion" | "eye_ointment" | "vaginal_cream"
    | "suppository" | "pessary" | "enema"
    | "sachet" | "powder" | "granules" | "ors"
    | "transdermal_patch"
    | "mouthwash" | "gargle"
    | "other";

export type ArchetypeKey =
    | "oral_solid" | "oral_liquid" | "injection" | "iv_fluid" | "drops"
    | "spray" | "inhaler" | "nebulizer" | "topical" | "insert"
    | "sachet" | "patch" | "mouthwash" | "generic";

export type RxDefaults = {
    route?: string;
    doseUnit?: string;
    site?: string;
    diluent?: { amount?: string; unit?: string };
};

// Ordered most-specific first; the first matching keyword wins.
const CATEGORY_RULES: ReadonlyArray<[MedicineCategory, string[]]> = [
    ["eye_ointment", ["eye ointment", "ophthalmic ointment", "opthalmic ointment"]],
    ["spray", ["nasal spray", "nasal inhaler", "gtn spray", "sublingual spray", "nitro"]],
    ["drops", ["eye drop", "ophthalmic", "opthalmic", "ear drop", "otic", "aural", "nasal drop", "nasal"]],
    ["inhaler", ["metered dose", "mdi", "dpi", "rotacap", "rotacaps", "inhaler", "inhalation", "hfa", "accuhaler", "turbuhaler"]],
    ["nebulizer", ["nebul", "respule", "respirator solution"]],
    ["iv_fluid", ["iv fluid", "i.v. fluid", "infusion", "drip", "iv solution", "large volume"]],
    ["suspension", ["suspension", "susp", "dry syrup", "powder for suspension"]],
    ["injection", ["injection", "inj", "ampoule", "parenteral"]],
    ["suppository", ["suppository", "supp"]],
    ["vaginal_cream", ["vaginal cream", "vaginal gel", "v/cream"]],
    ["pessary", ["pessary", "ovule", "vaginal tablet", "vaginal insert"]],
    ["enema", ["enema"]],
    ["transdermal_patch", ["transdermal", "patch"]],
    ["mouthwash", ["mouthwash", "mouth wash", "oral rinse"]],
    ["gargle", ["gargle"]],
    ["spray", ["spray"]],
    ["ors", ["ors", "oral rehydration", "rehydration salt"]],
    ["sachet", ["sachet"]],
    ["granules", ["granule", "gran."]],
    ["powder", ["powder"]],
    ["sublingual_tab", ["sublingual", "s/l tab"]],
    ["buccal_tab", ["buccal"]],
    ["lozenge", ["lozenge", "troche"]],
    ["syrup", ["syrup", "syp", "linctus"]],
    ["elixir", ["elixir"]],
    ["capsule", ["capsule", "cap", "pellet"]],
    ["tablet", ["tablet", "tab", "caplet", "pill"]],
    ["oral_drops", ["drop"]],
    ["oral_solution", ["solution", "liquid", "oral liquid"]],
    ["ointment", ["ointment", "oint"]],
    ["cream", ["cream"]],
    ["gel", ["gel", "jelly"]],
    ["lotion", ["lotion"]],
];

// Explicit mapping for every distinct dosage_form value in the medicine table
// (source: dosage_form.json). This is authoritative — edit here to fix any mapping.
// Keyword rules above are only a fallback for values not yet listed here.
const DOSAGE_FORM_CATEGORY: Record<string, MedicineCategory> = {
    "tablet": "tablet", "mups tablet": "tablet", "m r tablet": "tablet", "xr tablet": "tablet",
    "pr tablet": "tablet", "cr tablet": "tablet", "er tablet": "tablet", "sr tablet": "tablet",
    "dr tablet": "tablet", "md tablet": "tablet", "odt tablet": "tablet", "rapid tablet": "tablet",
    "mouth dissolving tablet": "tablet", "orodispersible tablet": "tablet", "dispersible tablet": "tablet",
    "chewable tablet": "tablet", "effervescent tablet": "tablet", "oral soluble film": "tablet", "bolus": "tablet",
    "capsule": "capsule", "sr capsule": "capsule", "er capsule": "capsule", "cr capsule": "capsule",
    "m r capsule": "capsule", "delayed release capsule": "capsule", "extended release capsule": "capsule",
    "soft gelatin capsule": "capsule", "sprinkle capsule": "capsule", "cozycap": "capsule",
    "gum": "lozenge",
    "syrup": "syrup", "cool syrup": "syrup", "linctus": "syrup", "elixir": "elixir",
    "suspension": "suspension", "oral suspension": "suspension", "oral emulsion": "suspension", "emulsion": "suspension",
    "pellets for suspension": "suspension", "granules for suspension": "suspension",
    "dr granules for suspension": "suspension", "powder for suspension": "suspension",
    "oral solution": "oral_solution", "oral liquid": "oral_solution", "liquid": "oral_solution",
    "solution": "oral_solution", "tincture": "oral_solution",
    "oral drops": "oral_drops", "paediatric drops": "oral_drops", "powder for pedriatric drop": "oral_drops", "drops": "oral_drops",
    "injection": "injection", "iv injection": "injection", "im injection": "injection",
    "iv/im injection": "injection", "solution for injection": "injection", "water for injection": "injection", "vaccine": "injection",
    "iv infusion": "iv_fluid", "solution for infusion": "iv_fluid", "dialysis solution": "iv_fluid", "pvc bag": "iv_fluid",
    "eye drops": "drops", "eye solution": "drops", "opthalmic solution": "drops",
    "ophthalmic emulsion": "drops", "eye cleanser solution": "drops",
    "ear drop": "drops", "ear spray": "drops",
    "nasal drops": "drops",
    "eye, ear & nasal drops": "drops", "eye and ear drops": "drops", "eye & nasal drops": "drops",
    "nasal spray": "spray", "spray": "spray",
    "metered dose inhaler": "inhaler", "dry powder inhaler": "inhaler", "hfa inhaler": "inhaler",
    "inhaler": "inhaler", "inhalation aerosol": "inhaler", "aerosol inhalation": "inhaler", "inhalation capsule": "inhaler",
    "nebuliser solution": "nebulizer", "nebuliser suspension": "nebulizer", "respirator suspension": "nebulizer",
    "resperitory solution": "nebulizer", "inhalation solution": "nebulizer", "inhalation liquid": "nebulizer",
    "ointment": "ointment", "scalp ointment": "ointment", "rectal ointment": "ointment", "oral paste": "ointment",
    "cream": "cream", "gel": "gel", "emulgel": "gel", "oral gel": "gel", "oral dental gel": "gel",
    "lotion": "lotion", "scalp lotion": "lotion", "shampoo": "lotion", "topical solution": "lotion",
    "topical suspension": "lotion", "pour on (solution)": "lotion",
    "eye ointment": "eye_ointment", "eye gel": "eye_ointment", "eye and ear ointment": "eye_ointment",
    "vaginal cream": "vaginal_cream", "vaginal gel": "vaginal_cream", "cervical gel": "vaginal_cream",
    "suppository": "suppository", "per rectal": "suppository",
    "vaginal suppository": "pessary", "vaginal pessary": "pessary", "vaginal tablet": "pessary",
    "sachet": "sachet", "sached powder": "sachet", "oral powder": "sachet", "powder": "sachet",
    "water soluble powder": "sachet", "oral granules": "sachet", "effervescent granules": "sachet",
    "powder for solution": "sachet", "powder for oral solution": "sachet",
    "ors tablet": "ors", "oral saline": "ors",
    "mouth wash": "mouthwash", "mouth wash antiseptic": "mouthwash", "gargle & mouth wash": "gargle",
    "needle for syringe": "other", "syringe": "other", "kit": "other", "condom": "other",
    "blood bag": "other", "blood tubing set": "other", "butterfly": "other", "raw materials": "other",
    "repacking": "other", "combipack": "other", "gas": "other", "implant": "other", "pellets": "other",
    "scrub": "other", "hand rub": "other", "root canal agent": "other", "canal irrigation": "other",
    "solution fo root cannel": "other", "viscoelastic solution": "other", "irrigation solution": "other",
};

export function normalizeDosageForm(raw?: string | null): MedicineCategory {
    if (!raw) return "other";
    const lower = raw.trim().toLowerCase();
    const exact = DOSAGE_FORM_CATEGORY[lower];
    if (exact) return exact;
    for (const [category, keywords] of CATEGORY_RULES) {
        if (keywords.some(keyword => lower.includes(keyword))) return category;
    }
    return "other";
}

const MODIFIED_RELEASE_KEYWORDS = [
    " sr", " xr", " er", " cr", " xl", " mr", " pr",
    "extended release", "sustained release", "modified release",
    "delayed release", "prolonged release", "enteric coated", "enteric-coated", " ec",
];

// Flags SR/XR/EC-style tablets/capsules so the editor can suggest a "Do not crush" note.
export function isModifiedRelease(raw?: string | null): boolean {
    if (!raw) return false;
    const padded = ` ${raw.toLowerCase()} `;
    return MODIFIED_RELEASE_KEYWORDS.some(keyword => padded.includes(keyword));
}

const CATEGORY_ARCHETYPE: Record<MedicineCategory, ArchetypeKey> = {
    tablet: "oral_solid", capsule: "oral_solid", sublingual_tab: "oral_solid", buccal_tab: "oral_solid", lozenge: "oral_solid",
    syrup: "oral_liquid", suspension: "oral_liquid", oral_solution: "oral_liquid", oral_drops: "oral_liquid", elixir: "oral_liquid",
    injection: "injection",
    iv_fluid: "iv_fluid",
    eye_drops: "drops", ear_drops: "drops", nasal_drops: "drops", drops: "drops",
    nasal_spray: "spray", gtn_spray: "spray", spray: "spray",
    inhaler: "inhaler",
    nebulizer: "nebulizer",
    ointment: "topical", cream: "topical", gel: "topical", lotion: "topical", eye_ointment: "topical", vaginal_cream: "topical",
    suppository: "insert", pessary: "insert", enema: "insert",
    sachet: "sachet", powder: "sachet", granules: "sachet", ors: "sachet",
    transdermal_patch: "patch",
    mouthwash: "mouthwash", gargle: "mouthwash",
    other: "generic",
};

export function getRxArchetype(category?: MedicineCategory): ArchetypeKey {
    if (!category) return "generic";
    return CATEGORY_ARCHETYPE[category];
}

const CATEGORY_DEFAULTS: Record<MedicineCategory, RxDefaults> = {
    tablet: { route: "P/O", doseUnit: "tablet" },
    lozenge: { route: "P/O", doseUnit: "tablet" },
    capsule: { route: "P/O", doseUnit: "capsule" },
    sublingual_tab: { route: "S/L", doseUnit: "tablet" },
    buccal_tab: { route: "Buccal", doseUnit: "tablet" },
    syrup: { route: "P/O", doseUnit: "TSF" },
    suspension: { route: "P/O", doseUnit: "TSF" },
    oral_solution: { route: "P/O", doseUnit: "TSF" },
    elixir: { route: "P/O", doseUnit: "TSF" },
    oral_drops: { route: "P/O", doseUnit: "drops" },
    injection: { route: "I/V", doseUnit: "Vial" },
    iv_fluid: { route: "I/V", doseUnit: "ml" },
    eye_drops: { route: "Ophthalmic", doseUnit: "drops", site: "O/E" },
    ear_drops: { route: "Otic", doseUnit: "drops" },
    nasal_drops: { route: "Nasal", doseUnit: "drops", site: "Each nostril" },
    drops: { doseUnit: "drops" },
    nasal_spray: { route: "Nasal", doseUnit: "spray", site: "Each nostril" },
    gtn_spray: { route: "S/L", doseUnit: "spray" },
    spray: { doseUnit: "spray" },
    inhaler: { route: "Inh.", doseUnit: "puff" },
    nebulizer: { route: "Neb.", doseUnit: "ml", diluent: { amount: "2.5", unit: "ml" } },
    ointment: { route: "Top.", site: "Affected area" },
    cream: { route: "Top.", site: "Affected area" },
    gel: { route: "Top.", site: "Affected area" },
    lotion: { route: "Top.", site: "Affected area" },
    eye_ointment: { route: "Ophthalmic", site: "O/E" },
    vaginal_cream: { route: "P/V", doseUnit: "Applicatorful" },
    suppository: { route: "P/R", doseUnit: "Stick" },
    pessary: { route: "P/V", doseUnit: "Pessary" },
    enema: { route: "P/R", doseUnit: "ml" },
    sachet: { route: "P/O", doseUnit: "Sachet" },
    powder: { route: "P/O", doseUnit: "Sachet" },
    granules: { route: "P/O", doseUnit: "Sachet" },
    ors: { route: "P/O", doseUnit: "Sachet" },
    transdermal_patch: { route: "Transdermal", doseUnit: "Patch", site: "Affected area" },
    mouthwash: { route: "P/O", doseUnit: "ml" },
    gargle: { route: "P/O", doseUnit: "ml" },
    other: { route: "P/O" },
};

export function getCategoryDefaults(category?: MedicineCategory): RxDefaults {
    if (!category) return CATEGORY_DEFAULTS.other;
    return CATEGORY_DEFAULTS[category];
}

// Smart per-medicine defaults read from the raw dosage_form text. The merged drops/spray
// categories are generic, so an "Eye Drop" still lands on the eye and a GTN spray sublingually.
export function getFormHints(rawDosageForm?: string | null, category?: MedicineCategory): RxDefaults {
    const text = (rawDosageForm ?? "").toLowerCase();
    if (category === "drops") {
        if (text.includes("eye") || text.includes("ophthalmic") || text.includes("opthalmic")) return { site: "O/E", route: "Ophthalmic" };
        if (text.includes("ear") || text.includes("otic") || text.includes("aural")) return { site: "Both ears", route: "Otic" };
        if (text.includes("nasal") || text.includes("nose")) return { site: "Each nostril", route: "Nasal" };
    }
    if (category === "spray") {
        if (text.includes("sublingual") || text.includes("gtn") || text.includes("nitro")) return { site: "Sublingual", route: "S/L" };
        if (text.includes("throat")) return { site: "Throat" };
        if (text.includes("nasal") || text.includes("nose")) return { site: "Each nostril", route: "Nasal" };
    }
    return {};
}

// Human label shown above the medicine name on the prescription (blank for unknown/custom).
export function categoryLabel(type?: string | null): string {
    if (!type || type === "other") return "";
    return CATEGORY_LABELS[type as MedicineCategory] ?? "";
}

export const CATEGORY_LABELS: Record<MedicineCategory, string> = {
    tablet: "Tablet",
    capsule: "Capsule",
    sublingual_tab: "Sublingual Tablet",
    buccal_tab: "Buccal Tablet",
    lozenge: "Lozenge",
    syrup: "Syrup",
    suspension: "Suspension",
    oral_solution: "Oral Solution",
    oral_drops: "Oral Drops",
    elixir: "Elixir",
    injection: "Injection",
    iv_fluid: "IV Fluid / Infusion",
    eye_drops: "Eye Drops",
    ear_drops: "Ear Drops",
    nasal_drops: "Nasal Drops",
    drops: "Drops",
    nasal_spray: "Nasal Spray",
    gtn_spray: "GTN Spray",
    spray: "Spray",
    inhaler: "Inhaler",
    nebulizer: "Nebulizer",
    ointment: "Ointment",
    cream: "Cream",
    gel: "Gel",
    lotion: "Lotion",
    eye_ointment: "Eye Ointment",
    vaginal_cream: "Vaginal Cream",
    suppository: "Suppository",
    pessary: "Pessary",
    enema: "Enema",
    sachet: "Sachet",
    powder: "Powder",
    granules: "Granules",
    ors: "ORS",
    transdermal_patch: "Transdermal Patch",
    mouthwash: "Mouthwash",
    gargle: "Gargle",
    other: "Other / Custom",
};

// Order used to populate the manual type-override dropdown.
export const MEDICINE_CATEGORIES: readonly MedicineCategory[] = [
    "tablet", "capsule", "sublingual_tab", "buccal_tab", "lozenge",
    "syrup", "suspension", "oral_solution", "oral_drops", "elixir",
    "injection", "iv_fluid",
    "drops", "spray", "inhaler", "nebulizer",
    "ointment", "cream", "gel", "lotion", "eye_ointment", "vaginal_cream",
    "suppository", "pessary", "enema",
    "sachet", "ors",
    "transdermal_patch",
    "mouthwash",
    "other",
];
