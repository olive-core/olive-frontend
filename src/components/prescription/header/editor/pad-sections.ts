import { BuildingIcon, PaletteIcon, PanelBottomIcon, UserRoundIcon, type LucideIcon } from "lucide-react";

import { HEADER_PRESETS, type EditableIdentity, type HeaderConfig } from "@/lib/header-config";
import { getPageSize, isPrePrinted } from "@/lib/print-paper";
import { MAX_FOOTER_CHAMBERS, padStateHasContent, type ChamberPad } from "@/lib/chamber-pad";
import { chamberSectionId, type PadSectionId } from "@/stores/header-config-store";

// Everything the editor's section list needs to describe itself: what each section is
// called in a doctor's words, what it currently says, whether it still needs filling in,
// and which section owns a given click on the live preview.

export interface PadSectionMeta {
    id:    PadSectionId;
    icon:  LucideIcon;
    title: string;
}

export const DOCTOR_SECTION: PadSectionMeta = { id: "doctor", icon: UserRoundIcon,   title: "Your details" };
export const STYLE_SECTION:  PadSectionMeta = { id: "style",  icon: PaletteIcon,     title: "Look of the pad" };
export const FOOTER_SECTION: PadSectionMeta = { id: "footer", icon: PanelBottomIcon, title: "Bottom of the page" };

export const CHAMBER_SECTION_ICON = BuildingIcon;

export function chamberSectionSummary(pad: ChamberPad): string {
    if (isPrePrinted(pad.paper)) {
        return `Your own printed pad · ${getPageSize(pad.paper.pageSize).label}`;
    }
    return padStateHasContent(pad) ? "Olive prints the letterhead" : "Olive letterhead · nothing added yet";
}

export function doctorSectionSummary(identity: EditableIdentity, designation: string): string {
    const filled = [identity.name, identity.qualification, designation].map((value) => value.trim()).filter(Boolean);
    return filled.length > 0 ? filled.join(" · ") : "Nothing added yet";
}

export function styleSectionSummary(config: HeaderConfig): string {
    const preset = HEADER_PRESETS.find((option) => option.value === config.preset)?.label ?? "Classic Split";
    return `${preset} · ${config.colorMode === "mono" ? "Black & white" : "Color"}`;
}

export function footerSectionSummary(pads: ChamberPad[]): string {
    const shown = Math.min(pads.filter((pad) => pad.showInFooter).length, MAX_FOOTER_CHAMBERS);
    if (shown === 0) return "Only the Olive mark";
    return `${shown} chamber${shown > 1 ? "s" : ""} printed at the bottom`;
}

export function doctorDetailsAreComplete(identity: EditableIdentity, designation: string): boolean {
    return Boolean(identity.name.trim() && identity.qualification.trim() && designation.trim());
}

// Maps a click on the live preview to the section that hosts the matching control. The
// chamber name and contact lines only ever render for the chamber being previewed, so
// they always belong to that chamber's section.
export function sectionForFocusKey(focusKey: string, previewChamberId: string | null): {
    section:   PadSectionId;
    targetKey: string;
} {
    if (focusKey.startsWith("footer-chamber-")) {
        return { section: "footer", targetKey: focusKey };
    }
    if ((focusKey === "chamberName" || focusKey.startsWith("contact-")) && previewChamberId) {
        return {
            section:   chamberSectionId(previewChamberId),
            targetKey: focusKey === "chamberName" ? `pad-${previewChamberId}-name` : focusKey,
        };
    }
    if (focusKey === "medicalSymbol" || focusKey === "logo") {
        return { section: "style", targetKey: focusKey };
    }
    return { section: "doctor", targetKey: focusKey };
}
