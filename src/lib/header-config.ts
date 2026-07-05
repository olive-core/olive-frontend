// The prescription letterhead's data model, its API (snake_case) conversions, and the
// color/monochrome palette derivation shared by every header preset and the editor.

export type HeaderPreset = "classic-split" | "centered-formal" | "modern-minimal";
export type HeaderColorMode = "color" | "mono";

export interface HeaderCustomField {
    id:    string;
    label: string;
    value: string;
}

export interface HeaderConfig {
    preset:         HeaderPreset;
    accentColor:    string;
    colorMode:      HeaderColorMode;
    showOliveBrand: boolean;
    showLogo:       boolean;
    designation:    string;
    chamberName:    string;
    chamberAddress: string;
    phones:         string[];
    visitingHours:  string;
    serial:         string;
    customFields:   HeaderCustomField[];
    logoBlobName:   string | null;
    logoUrl:        string | null;
}

// The doctor's identity stays authoritative on the clinician profile; the header only
// styles it and adds chamber/contact details around it.
export interface DoctorIdentity {
    firstName?:     string | null;
    lastName?:      string | null;
    qualification?: string | null;
    bmdcNo?:        string | null;
}

// The editable (always-string) form of the identity, used by the editor store and inputs.
export interface EditableIdentity {
    firstName:     string;
    lastName:      string;
    qualification: string;
    bmdcNo:        string;
}

export const DEFAULT_ACCENT_COLOR = "#10b981";

export const HEADER_PRESETS: { value: HeaderPreset; label: string; description: string }[] = [
    { value: "classic-split",   label: "Classic Split",   description: "Logo left, doctor centre, contact right" },
    { value: "centered-formal", label: "Centered Formal", description: "Institutional, everything centered" },
    { value: "modern-minimal",  label: "Modern Minimal",  description: "Clean name, thin rule, compact contact" },
];

// Familiar prescription letterhead colors offered as one-tap swatches.
export const ACCENT_SWATCHES = ["#10b981", "#0f766e", "#1d4ed8", "#0f172a", "#7c2d12", "#9d174d"];

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
    preset:         "classic-split",
    accentColor:    DEFAULT_ACCENT_COLOR,
    colorMode:      "color",
    showOliveBrand: true,
    showLogo:       true,
    designation:    "",
    chamberName:    "",
    chamberAddress: "",
    phones:         [],
    visitingHours:  "",
    serial:         "",
    customFields:   [],
    logoBlobName:   null,
    logoUrl:        null,
};

// The snake_case shape persisted in / returned by the clinician API's `header_config`.
export interface HeaderConfigApi {
    preset?:           string;
    accent_color?:     string;
    color_mode?:       string;
    show_olive_brand?: boolean;
    show_logo?:        boolean;
    designation?:      string | null;
    chamber_name?:     string | null;
    chamber_address?:  string | null;
    phones?:           string[] | null;
    visiting_hours?:   string | null;
    serial?:           string | null;
    custom_fields?:    { id: string; label?: string; value?: string }[] | null;
    logo_blob_name?:   string | null;
    logo_url?:         string | null;
}

function isHeaderPreset(value: unknown): value is HeaderPreset {
    return value === "classic-split" || value === "centered-formal" || value === "modern-minimal";
}

export function headerConfigFromApi(api?: HeaderConfigApi | null): HeaderConfig {
    if (!api) return { ...DEFAULT_HEADER_CONFIG };
    return {
        preset:         isHeaderPreset(api.preset) ? api.preset : DEFAULT_HEADER_CONFIG.preset,
        accentColor:    api.accent_color || DEFAULT_ACCENT_COLOR,
        colorMode:      api.color_mode === "mono" ? "mono" : "color",
        showOliveBrand: api.show_olive_brand ?? true,
        showLogo:       api.show_logo ?? true,
        designation:    api.designation ?? "",
        chamberName:    api.chamber_name ?? "",
        chamberAddress: api.chamber_address ?? "",
        phones:         api.phones ?? [],
        visitingHours:  api.visiting_hours ?? "",
        serial:         api.serial ?? "",
        customFields:   (api.custom_fields ?? []).map(field => ({
            id:    field.id,
            label: field.label ?? "",
            value: field.value ?? "",
        })),
        logoBlobName:   api.logo_blob_name ?? null,
        logoUrl:        api.logo_url ?? null,
    };
}

// The clinician PUT body the header editor sends: identity fields (which live on the
// profile) plus the serialized header_config.
export interface ClinicianHeaderUpdate {
    first_name:    string;
    last_name:     string;
    qualification: string;
    bmdc_no:       string;
    header_config: HeaderConfigApi;
}

export function buildHeaderUpdatePayload(identity: EditableIdentity, config: HeaderConfig): ClinicianHeaderUpdate {
    return {
        first_name:    identity.firstName.trim(),
        last_name:     identity.lastName.trim(),
        qualification: identity.qualification.trim(),
        bmdc_no:       identity.bmdcNo.trim(),
        header_config: headerConfigToApi(config),
    };
}

// Drops empty entries and the derived logoUrl so we only persist meaningful settings.
export function headerConfigToApi(config: HeaderConfig): HeaderConfigApi {
    return {
        preset:           config.preset,
        accent_color:     config.accentColor,
        color_mode:       config.colorMode,
        show_olive_brand: config.showOliveBrand,
        show_logo:        config.showLogo,
        designation:      config.designation.trim() || null,
        chamber_name:     config.chamberName.trim() || null,
        chamber_address:  config.chamberAddress.trim() || null,
        phones:           config.phones.map(phone => phone.trim()).filter(Boolean),
        visiting_hours:   config.visitingHours.trim() || null,
        serial:           config.serial.trim() || null,
        custom_fields:    config.customFields.filter(field => field.label.trim() || field.value.trim()),
        logo_blob_name:   config.logoBlobName,
    };
}

export interface HeaderPalette {
    accent:    string;  // rule, ℞ glyph and other brand accents (as inline style color)
    nameColor: string;  // the doctor's name
    isMono:    boolean;
}

// Monochrome forces near-black so nothing relies on color for emphasis — the guarantee
// that the header stays legible on a black-and-white printer.
export function getHeaderPalette(config: HeaderConfig): HeaderPalette {
    const isMono = config.colorMode === "mono";
    const slate900 = "#0f172a";
    return {
        accent:    isMono ? slate900 : config.accentColor,
        nameColor: isMono ? slate900 : config.accentColor,
        isMono,
    };
}

export function joinDoctorName(identity: DoctorIdentity): string {
    return `${identity.firstName ?? ""} ${identity.lastName ?? ""}`.trim();
}

// A header only renders its rich layout once the doctor has actually put something in it;
// otherwise consumers fall back to the plain name/qualification/BMDC header.
export function hasHeaderContent(config: HeaderConfig): boolean {
    return Boolean(
        config.designation.trim() ||
        config.chamberName.trim() ||
        config.chamberAddress.trim() ||
        config.visitingHours.trim() ||
        config.serial.trim() ||
        config.phones.some(phone => phone.trim()) ||
        config.customFields.some(field => field.label.trim() || field.value.trim()) ||
        (config.showLogo && config.logoUrl),
    );
}
