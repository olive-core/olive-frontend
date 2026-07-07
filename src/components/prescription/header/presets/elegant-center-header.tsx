import { Fragment, type ReactNode } from "react";

import { contactLineText, joinDoctorName, visibleContactLines } from "@/lib/header-config";
import { cn } from "@/lib/utils";
import type { HeaderRenderProps } from "../header-render-props";
import ContactLineIcon from "../parts/contact-line-icon";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import MedicalSymbol from "../parts/medical-symbol";
import OliveBrandMark from "../parts/olive-brand-mark";

const OLIVE_LOCKUP_WIDTH = 84;

function DotSeparated({ items, className }: { items: ReactNode[]; className?: string }) {
    if (items.length === 0) return null;
    return (
        <div className={cn("flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5", className)}>
            {items.map((item, index) => (
                <Fragment key={index}>
                    {index > 0 && <span className="text-slate-300">·</span>}
                    {item}
                </Fragment>
            ))}
        </div>
    );
}

// Prestige-consultant masthead: only the name earns centering; credentials and contact
// collapse into dot-separated lines so the header stays shallow. The center logo floats at
// the left edge and the medical symbol + Olive mark stack at the right (costing no height),
// and a thick-thin double rule closes the letterhead like engraved stationery.
export default function ElegantCenterHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;
    const name = joinDoctorName(identity);
    const lines = visibleContactLines(config);
    const showRightMarks = config.showMedicalSymbol || config.showOliveBrand;
    const hasSideMarks = Boolean(logoUrl) || showRightMarks;

    // The centered text needs symmetric padding wide enough to clear whichever side mark
    // is widest, so the name stays truly centered on the page.
    const rightMarksWidth = Math.max(
        config.showMedicalSymbol ? config.medicalSymbolWidth : 0,
        config.showOliveBrand ? OLIVE_LOCKUP_WIDTH : 0,
    );
    const sidePadding = hasSideMarks
        ? Math.max(logoUrl ? config.logoSize : 0, rightMarksWidth) + 16
        : 0;

    const credentialItems: ReactNode[] = [];
    if (identity.qualification) {
        credentialItems.push(
            <span key="qualification" data-focus="qualification" className="whitespace-pre-line">{identity.qualification}</span>,
        );
    }
    if (config.designation) {
        credentialItems.push(
            <span key="designation" data-focus="designation" className="whitespace-pre-line font-medium text-slate-700">{config.designation}</span>,
        );
    }
    if (identity.bmdcNo) {
        credentialItems.push(
            <span key="bmdc" data-focus="bmdcNo">BMDC <span className="font-semibold">{identity.bmdcNo}</span></span>,
        );
    }

    const contactItems: ReactNode[] = [];
    if (config.chamberName.trim()) {
        contactItems.push(
            <span key="chamber" data-focus="chamberName" className="font-semibold uppercase tracking-[0.08em] text-slate-700">
                {config.chamberName}
            </span>,
        );
    }
    lines.forEach((line) => {
        contactItems.push(
            <span key={line.id} data-focus={`contact-${line.id}`} className="flex items-center gap-1">
                <ContactLineIcon kind={line.kind} className="size-3 shrink-0 text-slate-400" />
                <span className="whitespace-pre-line">{contactLineText(line)}</span>
            </span>,
        );
    });

    return (
        <div className="relative">
            {logoUrl && (
                <HeaderLogo
                    url={logoUrl}
                    isMono={palette.isMono}
                    shape={config.logoShape}
                    size={config.logoSize}
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                />
            )}
            {showRightMarks && (
                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
                    {config.showMedicalSymbol && (
                        <MedicalSymbol width={config.medicalSymbolWidth} height={config.medicalSymbolHeight} />
                    )}
                    {config.showOliveBrand && <OliveBrandMark isMono={palette.isMono} size={24} />}
                </div>
            )}

            <div
                className="flex flex-col items-center text-center"
                style={hasSideMarks ? { paddingLeft: sidePadding, paddingRight: sidePadding } : undefined}
            >
                <h2
                    data-focus="firstName"
                    className="font-display text-[1.45rem] font-semibold leading-tight tracking-tight"
                    style={{ color: palette.nameColor }}
                >
                    {name || "Doctor name"}
                </h2>
                <DotSeparated items={credentialItems} className="mt-0.5 text-[13px] leading-snug text-slate-600" />
                <DotSeparated items={contactItems} className="mt-1 text-[12px] leading-snug text-slate-600" />
            </div>

            <HeaderAccentRule accent={palette.accent} variant="double" className="mt-2.5" />
        </div>
    );
}
