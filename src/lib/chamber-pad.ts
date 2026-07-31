// Per-chamber prescription-pad content (chamber.pad_config) and the client-side
// mirror of the backend's letterhead resolution: overlaying the active chamber's
// pad onto the doctor's global header style, and building the footer from the
// other chambers. Used by the compose screen (no snapshot exists yet), the
// header editor and the profile's chamber page.

import {
    type ContactLine,
    type ContactLineKind,
    type FooterModel,
    type HeaderConfig,
    CONTACT_LINE_KINDS,
} from "@/lib/header-config";
import {
    printPaperFromApi,
    printPaperToApi,
    isPrePrinted,
    type PrintPaper,
    type PrintPaperApi,
} from "@/lib/print-paper";
import type { Chamber } from "@/types/attendant-queue";
import { chamberLabel } from "@/types/attendant-queue";

// The snake_case shape persisted in / returned by the chamber API's `pad_config`.
export interface PadConfigApi {
    display_name?:   string | null;
    contact_lines?:  { id?: string; kind?: string; label?: string; value?: string }[] | null;
    logo_blob_name?: string | null;
    logo_url?:       string | null;
    show_in_footer?: boolean | null;
    footer_order?:   number | null;
    paper?:          PrintPaperApi | null;
}

// The editable (camelCase) form used by the editor store and the profile page.
export interface ChamberPad {
    displayName:  string;
    contactLines: ContactLine[];
    logoBlobName: string | null;
    logoUrl:      string | null;
    showInFooter: boolean;
    footerOrder:  number | null;
    paper:        PrintPaper;
}

function toContactLineKind(value: unknown): ContactLineKind {
    return CONTACT_LINE_KINDS.includes(value as ContactLineKind) ? (value as ContactLineKind) : "custom";
}

function contactLinesFromApi(api?: PadConfigApi["contact_lines"]): ContactLine[] {
    return (api ?? []).map((line) => ({
        id:    line.id ?? crypto.randomUUID(),
        kind:  toContactLineKind(line.kind),
        label: line.label ?? "",
        value: line.value ?? "",
    }));
}

export function padFromApi(api?: PadConfigApi | null): ChamberPad {
    return {
        displayName:  api?.display_name ?? "",
        contactLines: contactLinesFromApi(api?.contact_lines),
        logoBlobName: api?.logo_blob_name ?? null,
        logoUrl:      api?.logo_url ?? null,
        showInFooter: api?.show_in_footer ?? true,
        footerOrder:  api?.footer_order ?? null,
        paper:        printPaperFromApi(api?.paper),
    };
}

// A pre-printed pad already carries the doctor's letterhead on the paper, so Olive
// prints only the prescription body inside the window the pad leaves blank.
export function padPrintsLetterhead(pad: ChamberPad): boolean {
    return !isPrePrinted(pad.paper);
}

// Drops empty lines and the derived logoUrl so we only persist meaningful settings.
export function padToApi(pad: ChamberPad): PadConfigApi {
    return {
        display_name:   pad.displayName.trim() || null,
        contact_lines:  pad.contactLines
            .filter((line) => line.value.trim() || line.label.trim())
            .map((line) => ({ id: line.id, kind: line.kind, label: line.label.trim(), value: line.value.trim() })),
        logo_blob_name: pad.logoBlobName,
        show_in_footer: pad.showInFooter,
        footer_order:   pad.footerOrder,
        paper:          printPaperToApi(pad.paper),
    };
}

export function padHasContent(api?: PadConfigApi | null): boolean {
    return padStateHasContent(padFromApi(api));
}

// A pre-printed pad is fully set up with no letterhead content at all — the paper
// carries it — so "configured" is a wider question than "has letterhead content".
export function padIsConfigured(api?: PadConfigApi | null): boolean {
    return padStateIsConfigured(padFromApi(api));
}

export function padStateIsConfigured(pad: ChamberPad): boolean {
    return padStateHasContent(pad) || isPrePrinted(pad.paper);
}

// The pad's display name, falling back to the hospital the chamber sits in.
export function padDisplayName(chamber: Chamber): string {
    return (chamber.pad_config?.display_name ?? "").trim() || chamberLabel(chamber);
}

// Client-side mirror of the backend overlay: the active chamber's pad replaces the
// style config's chamber fields; style keys stay untouched.
export function applyChamberPad(config: HeaderConfig, chamber: Chamber): HeaderConfig {
    const pad = padFromApi(chamber.pad_config);
    return padStateHasContent(pad) ? applyPadState(config, chamber, pad) : config;
}

// Client-side mirror of the backend footer resolution: the doctor's other chambers,
// opted in via show_in_footer, ordered, capped, and compacted to text lines.
export function buildChamberFooter(
    chambers: Chamber[],
    activeChamberId: string | null | undefined,
): FooterModel {
    const pads = Object.fromEntries(
        chambers.map((chamber) => [chamber.chamber_id, padFromApi(chamber.pad_config)]),
    );
    return buildFooterFromPadStates(chambers, pads, activeChamberId ?? null);
}

// Kinds worth repeating in a compact footer line (custom lines stay off to save space).
const FOOTER_LINE_KINDS: ContactLineKind[] = ["address", "phone", "hours", "serial"];
export const MAX_FOOTER_CHAMBERS = 3;

export function padStateHasContent(pad: ChamberPad): boolean {
    return Boolean(
        pad.displayName.trim() ||
        pad.logoBlobName ||
        pad.contactLines.some((line) => line.value.trim() || line.label.trim()),
    );
}

export function applyPadState(config: HeaderConfig, chamber: Chamber, pad: ChamberPad): HeaderConfig {
    return {
        ...config,
        chamberName:  pad.displayName.trim() || chamberLabel(chamber),
        contactLines: pad.contactLines,
        logoBlobName: pad.logoBlobName,
        logoUrl:      pad.logoUrl,
    };
}

export function buildFooterFromPadStates(
    chambers: Chamber[],
    pads: Record<string, ChamberPad>,
    activeChamberId: string | null,
): FooterModel {
    const candidates = chambers
        .filter((chamber) => chamber.chamber_id !== activeChamberId)
        .map((chamber) => ({ chamber, pad: pads[chamber.chamber_id] }))
        .filter(({ pad }) => pad && pad.showInFooter)
        .map(({ chamber, pad }) => ({
            id:    chamber.chamber_id,
            name:  pad.displayName.trim() || chamberLabel(chamber),
            lines: footerLines(pad),
            order: pad.footerOrder,
        }))
        .filter((entry) => entry.name);

    candidates.sort((a, b) => {
        if (a.order === null && b.order === null) return 0;
        if (a.order === null) return 1;
        if (b.order === null) return -1;
        return a.order - b.order;
    });

    return {
        chambers: candidates
            .slice(0, MAX_FOOTER_CHAMBERS)
            .map(({ id, name, lines }) => ({ id, name, lines })),
    };
}

function footerLines(pad: ChamberPad): string[] {
    const lines: string[] = [];
    for (const kind of FOOTER_LINE_KINDS) {
        for (const line of pad.contactLines) {
            if (line.kind !== kind) continue;
            const value = line.value.trim();
            if (value) lines.push(value);
        }
    }
    return lines;
}
