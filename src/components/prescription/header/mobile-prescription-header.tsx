import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    getHeaderPalette,
    hasContactContent,
    type DoctorIdentity,
    type HeaderConfig,
} from "@/lib/header-config";
import DoctorIdentityBlock from "./parts/doctor-identity-block";
import ChamberContactBlock from "./parts/chamber-contact-block";
import HeaderAccentRule from "./parts/header-accent-rule";
import HeaderLogo from "./parts/header-logo";

interface MobilePrescriptionHeaderProps {
    identity: DoctorIdentity;
    config:   HeaderConfig;
}

// Phone-width letterhead: the doctor's identity stays visible, and the chamber/contact
// block collapses behind a clearly-labeled disclosure so the header doesn't push the
// actual prescription off-screen. Screen only — printing always uses the full-width
// letterhead from the hidden print DOM.
export default function MobilePrescriptionHeader({ identity, config }: MobilePrescriptionHeaderProps) {
    const palette = getHeaderPalette(config);
    const [open, setOpen] = useState(false);
    const logoUrl = config.showLogo ? config.logoUrl : null;
    const showContact = hasContactContent(config);
    const chamberName = config.chamberName.trim();

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <DoctorIdentityBlock identity={identity} config={config} palette={palette} />
                {logoUrl && (
                    <HeaderLogo
                        url={logoUrl}
                        isMono={palette.isMono}
                        shape={config.logoShape}
                        size={Math.min(config.logoSize, 44)}
                        className="shrink-0"
                    />
                )}
            </div>

            {showContact && (
                <>
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls="rx-header-details"
                        onClick={() => setOpen((current) => !current)}
                        className="mt-2 flex min-h-9 w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold text-slate-600"
                    >
                        <span className="truncate">{chamberName || "Chamber & contact"}</span>
                        <ChevronDownIcon
                            aria-hidden
                            className={cn(
                                "size-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none",
                                open && "rotate-180",
                            )}
                        />
                    </button>
                    <div
                        id="rx-header-details"
                        className={cn(
                            "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
                            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                    >
                        <div className="min-h-0 overflow-hidden">
                            <ChamberContactBlock
                                config={config}
                                align="left"
                                showChamberName={false}
                                className="px-3 pb-1 pt-2"
                            />
                        </div>
                    </div>
                </>
            )}

            <HeaderAccentRule accent={palette.accent} className="mt-2" />
        </div>
    );
}
