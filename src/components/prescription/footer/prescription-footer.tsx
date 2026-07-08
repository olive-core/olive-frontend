import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import {
    getHeaderPalette,
    type FooterChamber,
    type FooterModel,
    type HeaderConfig,
    type HeaderPalette,
} from "@/lib/header-config";
import { cn } from "@/lib/utils";
import HeaderAccentRule from "../header/parts/header-accent-rule";
import OliveBrandMark from "../header/parts/olive-brand-mark";

interface PrescriptionFooterProps {
    footer:      FooterModel;
    config:      HeaderConfig;
    className?:  string;
    /** Screen-only: phones collapse the chamber list behind a disclosure. Print is unaffected. */
    collapsible?: boolean;
}

function FooterChamberEntry({ chamber }: { chamber: FooterChamber }) {
    return (
        <div
            data-focus={`footer-chamber-${chamber.id}`}
            className="min-w-0 max-w-[62mm] text-[9.5px] leading-[1.35] text-slate-600"
        >
            <span className="font-semibold text-slate-700">{chamber.name}</span>
            {chamber.lines.length > 0 && (
                <span className="line-clamp-2 block">{chamber.lines.join(" · ")}</span>
            )}
        </div>
    );
}

// The other chambers get 80% of the width, the brand mark the remaining 20%.
function FullFooter({ footer, palette }: { footer: FooterModel; palette: HeaderPalette }) {
    return (
        <div className="flex items-end gap-4">
            <div className="flex min-w-0 basis-4/5 flex-wrap gap-x-6 gap-y-1">
                {footer.chambers.map((chamber) => (
                    <FooterChamberEntry key={chamber.id} chamber={chamber} />
                ))}
            </div>
            <div className="flex basis-1/5 justify-end">
                <OliveBrandMark isMono={palette.isMono} className="pb-px" />
            </div>
        </div>
    );
}

function CollapsedFooter({ footer, palette }: { footer: FooterModel; palette: HeaderPalette }) {
    const [open, setOpen] = useState(false);
    const count = footer.chambers.length;

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                {count > 0 ? (
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls="rx-footer-chambers"
                        onClick={() => setOpen((current) => !current)}
                        className="flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                        <span>
                            {count} more {count === 1 ? "chamber" : "chambers"}
                        </span>
                        <ChevronDownIcon
                            aria-hidden
                            className={cn(
                                "size-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none",
                                open && "rotate-180",
                            )}
                        />
                    </button>
                ) : (
                    <div />
                )}
                <OliveBrandMark isMono={palette.isMono} className="shrink-0" />
            </div>
            {count > 0 && (
                <div
                    id="rx-footer-chambers"
                    className={cn(
                        "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                >
                    <div className="min-h-0 overflow-hidden">
                        <div className="flex flex-col gap-1.5 px-3 pt-2">
                            {footer.chambers.map((chamber) => (
                                <FooterChamberEntry key={chamber.id} chamber={chamber} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// The printed prescription's footer: the doctor's OTHER chambers as compact text lines
// (max 3, no logos — the active chamber owns the header) with the always-on Olive brand
// mark on the right. Kept within ~15mm so the page stays a prescription, not a directory.
export default function PrescriptionFooter({ footer, config, className, collapsible = false }: PrescriptionFooterProps) {
    const palette = getHeaderPalette(config);

    return (
        <div className={className}>
            <HeaderAccentRule accent={palette.accent} variant="hairline" className="mb-1.5" />
            {collapsible ? (
                <>
                    <div className="hidden sm:block print:block">
                        <FullFooter footer={footer} palette={palette} />
                    </div>
                    <div className="sm:hidden print:hidden">
                        <CollapsedFooter footer={footer} palette={palette} />
                    </div>
                </>
            ) : (
                <FullFooter footer={footer} palette={palette} />
            )}
        </div>
    );
}
