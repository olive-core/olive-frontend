// The prescription letterhead's data model, its API (snake_case) conversions, and the
// color/monochrome palette derivation shared by every header preset and the editor.

import { printPaperFromApi, type PrintPaper, type PrintPaperApi } from "@/lib/print-paper";

export type HeaderPreset = "classic-split" | "accent-bar";
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
    showMedicalSymbol:   boolean;
    medicalSymbolWidth:  number;
    medicalSymbolHeight: number;
    showLogo:            boolean;
    logoSize:            number;
    logoShape:           LogoShape;
    designation:         string;
    nameBn:              string;  // optional Bangla name, stacked under the English name
    chamberName:         string;
    contactLines:        ContactLine[];
    logoBlobName:        string | null;
    logoUrl:             string | null;
}

// The doctor's identity stays authoritative on the clinician profile; the header only
// styles it and adds chamber/contact details around it.
export interface DoctorIdentity {
    name?:          string | null;
    qualification?: string | null;
    bmdcNo?:        string | null;
}

// The editable (always-string) form of the identity, used by the editor store and inputs.
export interface EditableIdentity {
    name:          string;
    qualification: string;
    bmdcNo:        string;
}

export const DEFAULT_ACCENT_COLOR = "#10b981";
export const MIN_LOGO_SIZE = 32;
export const MAX_LOGO_SIZE = 128;
export const MIN_SYMBOL_SIZE = 20;
export const MAX_SYMBOL_SIZE = 80;

export const HEADER_PRESETS: { value: HeaderPreset; label: string; description: string }[] = [
    { value: "classic-split", label: "Classic Split", description: "Doctor left, contact right" },
    { value: "accent-bar",    label: "Accent Bar",    description: "Bold side bar, modern" },
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
    showMedicalSymbol:   true,
    medicalSymbolWidth:  38,
    medicalSymbolHeight: 38,
    showLogo:            true,
    logoSize:            56,
    logoShape:           "circle",
    designation:         "",
    nameBn:              "",
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
    show_medical_symbol?:   boolean;
    medical_symbol_width?:  number;
    medical_symbol_height?: number;
    show_logo?:             boolean;
    logo_size?:             number;
    logo_shape?:            string;
    designation?:           string | null;
    name_bn?:               string | null;
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
    "elegant-center":    "classic-split",
    "centered-formal":   "classic-split",
    "centered-masthead": "classic-split",
    "modern-minimal":    "accent-bar",
    "branded-band":      "accent-bar",
};

function isHeaderPreset(value: unknown): value is HeaderPreset {
    return value === "classic-split" || value === "accent-bar";
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
        showMedicalSymbol:   api.show_medical_symbol ?? true,
        medicalSymbolWidth:  clampSymbolSize(api.medical_symbol_width ?? legacySymbolSize ?? 38),
        medicalSymbolHeight: clampSymbolSize(api.medical_symbol_height ?? legacySymbolSize ?? 38),
        showLogo:            api.show_logo ?? true,
        logoSize:            clampLogoSize(api.logo_size ?? legacyLogoSize ?? 56),
        logoShape:           normalizeLogoShape(api.logo_shape),
        designation:         api.designation ?? "",
        nameBn:              api.name_bn ?? "",
        chamberName:         api.chamber_name ?? "",
        contactLines:        readContactLines(api),
        logoBlobName:        api.logo_blob_name ?? null,
        logoUrl:             api.logo_url ?? null,
    };
}

// Chamber/contact/logo content lives only on a chamber's own `pad_config`, never on the
// clinician's style config. Use this (instead of `headerConfigFromApi`) whenever a live,
// not-yet-frozen letterhead starts from `clinician.header_config`, before any chamber
// overlay is applied — it strips any legacy "personal pad" values so a session with no
// active chamber renders no chamber block instead of leaking stale, chamber-less data.
// `headerConfigFromApi` itself stays untouched: it still needs to parse already-resolved
// configs (a saved prescription's `render_config.header`, or a chamber-overlaid config)
// which legitimately carry these fields.
export function clinicianStyleConfig(api?: HeaderConfigApi | null): HeaderConfig {
    return {
        ...headerConfigFromApi(api),
        chamberName:  "",
        contactLines: [],
        logoBlobName: null,
        logoUrl:      null,
    };
}

// The clinician PUT body the header editor sends: identity fields (which live on the
// profile) plus the serialized header_config.
export interface ClinicianHeaderUpdate {
    name:            string;
    qualification:   string;
    specializations: string[];
    bmdc_no:         string;
    header_config:   HeaderConfigApi;
}

// The pad's designation IS the doctor's specialization — the profile displays it and
// the AI draft pipeline reads it — so every pad save keeps the two in lockstep.
export function specializationsFromDesignation(designation: string): string[] {
    return designation
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
}

export function buildHeaderUpdatePayload(identity: EditableIdentity, config: HeaderConfig): ClinicianHeaderUpdate {
    return {
        name:            identity.name.trim(),
        qualification:   identity.qualification.trim(),
        specializations: specializationsFromDesignation(config.designation),
        bmdc_no:         identity.bmdcNo.trim(),
        header_config:   headerConfigToApi(config),
    };
}

// Drops empty lines and the derived logoUrl so we only persist meaningful settings.
export function headerConfigToApi(config: HeaderConfig): HeaderConfigApi {
    return {
        preset:              config.preset,
        accent_color:        config.accentColor,
        color_mode:          config.colorMode,
        show_medical_symbol:   config.showMedicalSymbol,
        medical_symbol_width:  clampSymbolSize(config.medicalSymbolWidth),
        medical_symbol_height: clampSymbolSize(config.medicalSymbolHeight),
        show_logo:             config.showLogo,
        logo_size:             clampLogoSize(config.logoSize),
        logo_shape:            config.logoShape,
        designation:         config.designation.trim() || null,
        name_bn:             config.nameBn.trim() || null,
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
    return (identity.name ?? "").trim();
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
        config.nameBn.trim() ||
        hasContactContent(config) ||
        (config.showLogo && config.logoUrl),
    );
}

// ---------------------------------------------------------------------------
// Footer + issued-prescription snapshot (prescription.render_config)
// ---------------------------------------------------------------------------

// A compact footer entry for one of the doctor's other chambers (never the one
// the prescription was written at, and never with a logo).
export interface FooterChamber {
    id:    string;
    name:  string;
    lines: string[];
}

// The "Powered by Olive" brand mark always prints; the footer model only carries the
// doctor's other chambers.
export interface FooterModel {
    chambers: FooterChamber[];
}

// The frozen letterhead a prescription was issued with, as persisted by the
// backend at save time. `header` already has the active chamber's pad overlaid,
// and `paper` freezes the physical pad it was printed on.
export interface RenderConfigApi {
    paper?:    PrintPaperApi | null;
    version?:  number;
    identity?: {
        name?:          string | null;
        // legacy snapshots (pre single-name) carried split fields
        first_name?:    string | null;
        last_name?:     string | null;
        name_bn?:       string | null;
        qualification?: string | null;
        bmdc_no?:       string | null;
    } | null;
    header?: HeaderConfigApi | null;
    footer?: {
        chambers?: { chamber_id?: string; name?: string; lines?: string[] }[] | null;
    } | null;
    active_chamber_id?: string | null;
}

export function buildFallbackFooter(): FooterModel {
    return { chambers: [] };
}

function footerFromApi(api: RenderConfigApi["footer"]): FooterModel {
    if (!api) return buildFallbackFooter();
    return {
        chambers: (api.chambers ?? [])
            .filter((chamber) => chamber.name)
            .map((chamber) => ({
                id:    chamber.chamber_id ?? chamber.name!,
                name:  chamber.name!,
                lines: chamber.lines ?? [],
            })),
    };
}

// What the prescription detail endpoint carries for the letterhead: the snapshot
// plus live-clinician fields for legacy rows saved before snapshots existed.
export interface LetterheadSource {
    render_config?:           RenderConfigApi | null;
    clinician_name?:          string | null;
    qualification?:           string | null;
    bmdc_no?:                 string | null;
    clinician_header_config?: HeaderConfigApi | null;
}

export interface ResolvedLetterhead {
    identity: DoctorIdentity;
    config:   HeaderConfig;
    footer:   FooterModel;
    /** The pad this prescription is printed on. Pre-printed pads suppress the rest. */
    paper:    PrintPaper;
}

// Legacy snapshots (pre single-name) stored first_name/last_name; new ones store name.
function snapshotIdentityName(identity: RenderConfigApi["identity"]): string | null | undefined {
    if (!identity) return undefined;
    if (identity.name) return identity.name;
    const legacy = `${identity.first_name ?? ""} ${identity.last_name ?? ""}`.trim();
    return legacy || undefined;
}

// Snapshot-first: an issued prescription renders exactly what it was saved with.
// The optional live clinician profile only backfills legacy rows (and the compose
// screen, which has no snapshot yet).
export function resolveLetterhead(
    detail: LetterheadSource,
    liveClinician?: {
        name?:          string | null;
        qualification?: string | null;
        bmdc_no?:       string | null;
        header_config?: HeaderConfigApi | null;
    },
): ResolvedLetterhead {
    const snapshot = detail.render_config;
    if (snapshot?.header) {
        const config = headerConfigFromApi(snapshot.header);
        return {
            identity: {
                name:          snapshotIdentityName(snapshot.identity),
                qualification: snapshot.identity?.qualification,
                bmdcNo:        snapshot.identity?.bmdc_no,
            },
            config,
            footer: footerFromApi(snapshot.footer),
            paper:  printPaperFromApi(snapshot.paper),
        };
    }

    const headerConfigApi = detail.clinician_header_config ?? liveClinician?.header_config ?? null;
    const config = headerConfigFromApi(headerConfigApi);
    return {
        identity: {
            name:          liveClinician?.name ?? detail.clinician_name,
            qualification: detail.qualification ?? liveClinician?.qualification,
            bmdcNo:        detail.bmdc_no ?? liveClinician?.bmdc_no,
        },
        config,
        footer: buildFallbackFooter(),
        paper:  printPaperFromApi(null),
    };
}
