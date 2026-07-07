// The prescription letterhead's data model, its API (snake_case) conversions, and the
// color/monochrome palette derivation shared by every header preset and the editor.

export type HeaderPreset = "classic-split" | "elegant-center" | "accent-bar";
export type HeaderColorMode = "color" | "mono";
export type LogoShape = "circle" | "rounded" | "square";
export type ContactLineKind = "address" | "phone" | "hours" | "serial" | "custom";

// A single reorderable line in the contact area. `kind` selects the icon; `label` is only
// meaningful for custom lines (e.g. "Website: olive.health").
export interface ContactLine {
    id:    string;
    kind:  ContactLineKind;
    label: string;
    value: string;
}

export interface HeaderConfig {
    preset:              HeaderPreset;
    accentColor:         string;
    colorMode:           HeaderColorMode;
    showOliveBrand:      boolean;
    showMedicalSymbol:   boolean;
    medicalSymbolWidth:  number;
    medicalSymbolHeight: number;
    showLogo:            boolean;
    logoSize:            number;
    logoShape:           LogoShape;
    designation:         string;
    chamberName:         string;
    contactLines:        ContactLine[];
    logoBlobName:        string | null;
    logoUrl:             string | null;
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
export const MIN_LOGO_SIZE = 32;
export const MAX_LOGO_SIZE = 128;
export const MIN_SYMBOL_SIZE = 20;
export const MAX_SYMBOL_SIZE = 80;

export const HEADER_PRESETS: { value: HeaderPreset; label: string; description: string }[] = [
    { value: "classic-split",  label: "Classic Split",  description: "Doctor left, contact right" },
    { value: "elegant-center", label: "Elegant Center", description: "Centered name, double rule" },
    { value: "accent-bar",     label: "Accent Bar",     description: "Bold side bar, modern" },
];

// Familiar prescription letterhead colors offered as one-tap swatches.
export const ACCENT_SWATCHES = ["#10b981", "#0f766e", "#1d4ed8", "#0f172a", "#7c2d12", "#9d174d"];

export const CONTACT_LINE_KIND_META: Record<ContactLineKind, { label: string; placeholder: string }> = {
    address: { label: "Address",        placeholder: "House 12, Road 5, Dhanmondi, Dhaka" },
    phone:   { label: "Phone",          placeholder: "01711-XXXXXX" },
    hours:   { label: "Visiting hours", placeholder: "Sat–Thu, 6:00 – 9:00 PM" },
    serial:  { label: "Serial",         placeholder: "Serial: 01711-XXXXXX" },
    custom:  { label: "Custom line",    placeholder: "e.g. www.clinic.com" },
};

export const CONTACT_LINE_KINDS: ContactLineKind[] = ["address", "phone", "hours", "serial", "custom"];

export function newContactLine(kind: ContactLineKind): ContactLine {
    return { id: crypto.randomUUID(), kind, label: "", value: "" };
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
    preset:              "classic-split",
    accentColor:         DEFAULT_ACCENT_COLOR,
    colorMode:           "color",
    showOliveBrand:      true,
    showMedicalSymbol:   true,
    medicalSymbolWidth:  38,
    medicalSymbolHeight: 38,
    showLogo:            true,
    logoSize:            56,
    logoShape:           "circle",
    designation:         "",
    chamberName:         "",
    contactLines:        [],
    logoBlobName:        null,
    logoUrl:             null,
};

// The snake_case shape persisted in / returned by the clinician API's `header_config`.
// Legacy single-purpose fields are still accepted on read so any earlier config migrates
// cleanly into the unified contact-line list.
export interface HeaderConfigApi {
    preset?:                string;
    accent_color?:          string;
    color_mode?:            string;
    show_olive_brand?:      boolean;
    show_medical_symbol?:   boolean;
    medical_symbol_width?:  number;
    medical_symbol_height?: number;
    show_logo?:             boolean;
    logo_size?:             number;
    logo_shape?:            string;
    designation?:           string | null;
    chamber_name?:          string | null;
    contact_lines?:         { id?: string; kind?: string; label?: string; value?: string }[] | null;
    logo_blob_name?:        string | null;
    logo_url?:              string | null;
    // legacy (read-only migration)
    medical_symbol_size?:   number;
    logo_width?:            number;
    logo_height?:           number;
    logo_scale?:            number;
    // legacy (read-only migration)
    chamber_address?:  string | null;
    phones?:           string[] | null;
    visiting_hours?:   string | null;
    serial?:           string | null;
    custom_fields?:    { id?: string; label?: string; value?: string }[] | null;
}

const LEGACY_PRESET_MAP: Record<string, HeaderPreset> = {
    "centered-formal":   "elegant-center",
    "centered-masthead": "elegant-center",
    "modern-minimal":    "accent-bar",
    "branded-band":      "accent-bar",
};

function isHeaderPreset(value: unknown): value is HeaderPreset {
    return value === "classic-split" || value === "elegant-center" || value === "accent-bar";
}

function normalizePreset(value: unknown): HeaderPreset {
    if (isHeaderPreset(value)) return value;
    return LEGACY_PRESET_MAP[value as string] ?? DEFAULT_HEADER_CONFIG.preset;
}

function isContactLineKind(value: unknown): value is ContactLineKind {
    return CONTACT_LINE_KINDS.includes(value as ContactLineKind);
}

function migrateLegacyContactLines(api: HeaderConfigApi): ContactLine[] {
    const lines: ContactLine[] = [];
    if (api.chamber_address) lines.push({ id: crypto.randomUUID(), kind: "address", label: "", value: api.chamber_address });
    (api.phones ?? []).forEach((phone) => lines.push({ id: crypto.randomUUID(), kind: "phone", label: "", value: phone }));
    if (api.visiting_hours) lines.push({ id: crypto.randomUUID(), kind: "hours", label: "", value: api.visiting_hours });
    if (api.serial) lines.push({ id: crypto.randomUUID(), kind: "serial", label: "", value: api.serial });
    (api.custom_fields ?? []).forEach((field) =>
        lines.push({ id: field.id ?? crypto.randomUUID(), kind: "custom", label: field.label ?? "", value: field.value ?? "" }),
    );
    return lines;
}

function readContactLines(api: HeaderConfigApi): ContactLine[] {
    if (api.contact_lines) {
        return api.contact_lines.map((line) => ({
            id:    line.id ?? crypto.randomUUID(),
            kind:  isContactLineKind(line.kind) ? line.kind : "custom",
            label: line.label ?? "",
            value: line.value ?? "",
        }));
    }
    return migrateLegacyContactLines(api);
}

function normalizeLogoShape(value: unknown): LogoShape {
    if (value === "rounded" || value === "square") return value;
    return "circle";
}

function clamp(value: number, min: number, max: number, fallback: number): number {
    if (Number.isNaN(value)) return fallback;
    return Math.min(max, Math.max(min, value));
}

export function clampLogoSize(value: number): number {
    return clamp(value, MIN_LOGO_SIZE, MAX_LOGO_SIZE, 56);
}

export function clampSymbolSize(value: number): number {
    return clamp(value, MIN_SYMBOL_SIZE, MAX_SYMBOL_SIZE, 38);
}

export function headerConfigFromApi(api?: HeaderConfigApi | null): HeaderConfig {
    if (!api) return { ...DEFAULT_HEADER_CONFIG };
    const legacyLogoSize = api.logo_width ?? api.logo_height ?? (api.logo_scale ? 56 * api.logo_scale : undefined);
    const legacySymbolSize = api.medical_symbol_size;
    return {
        preset:              normalizePreset(api.preset),
        accentColor:         api.accent_color || DEFAULT_ACCENT_COLOR,
        colorMode:           api.color_mode === "mono" ? "mono" : "color",
        showOliveBrand:      api.show_olive_brand ?? true,
        showMedicalSymbol:   api.show_medical_symbol ?? true,
        medicalSymbolWidth:  clampSymbolSize(api.medical_symbol_width ?? legacySymbolSize ?? 38),
        medicalSymbolHeight: clampSymbolSize(api.medical_symbol_height ?? legacySymbolSize ?? 38),
        showLogo:            api.show_logo ?? true,
        logoSize:            clampLogoSize(api.logo_size ?? legacyLogoSize ?? 56),
        logoShape:           normalizeLogoShape(api.logo_shape),
        designation:         api.designation ?? "",
        chamberName:         api.chamber_name ?? "",
        contactLines:        readContactLines(api),
        logoBlobName:        api.logo_blob_name ?? null,
        logoUrl:             api.logo_url ?? null,
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

// Drops empty lines and the derived logoUrl so we only persist meaningful settings.
export function headerConfigToApi(config: HeaderConfig): HeaderConfigApi {
    return {
        preset:              config.preset,
        accent_color:        config.accentColor,
        color_mode:          config.colorMode,
        show_olive_brand:      config.showOliveBrand,
        show_medical_symbol:   config.showMedicalSymbol,
        medical_symbol_width:  clampSymbolSize(config.medicalSymbolWidth),
        medical_symbol_height: clampSymbolSize(config.medicalSymbolHeight),
        show_logo:             config.showLogo,
        logo_size:             clampLogoSize(config.logoSize),
        logo_shape:            config.logoShape,
        designation:         config.designation.trim() || null,
        chamber_name:        config.chamberName.trim() || null,
        contact_lines:       config.contactLines
            .filter((line) => line.value.trim() || line.label.trim())
            .map((line) => ({ id: line.id, kind: line.kind, label: line.label.trim(), value: line.value.trim() })),
        logo_blob_name:      config.logoBlobName,
    };
}

export interface HeaderPalette {
    accent:    string;  // rules, bars and other brand accents (as inline style color)
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

export function visibleContactLines(config: HeaderConfig): ContactLine[] {
    return config.contactLines.filter((line) => line.value.trim() || line.label.trim());
}

export function contactLineText(line: ContactLine): string {
    const label = line.label.trim();
    const value = line.value.trim();
    if (line.kind === "custom" && label && value) return `${label}: ${value}`;
    return value || label;
}

export function hasContactContent(config: HeaderConfig): boolean {
    return Boolean(config.chamberName.trim() || visibleContactLines(config).length > 0);
}

// A header only renders its rich layout once the doctor has actually put something in it;
// otherwise consumers fall back to the plain name/qualification/BMDC header.
export function hasHeaderContent(config: HeaderConfig): boolean {
    return Boolean(
        config.designation.trim() ||
        hasContactContent(config) ||
        (config.showLogo && config.logoUrl),
    );
}
