import { hasContactContent } from "@/lib/header-config";
import type { HeaderRenderProps } from "../header-render-props";
import DoctorIdentityBlock from "../parts/doctor-identity-block";
import ChamberContactBlock from "../parts/chamber-contact-block";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import MedicalSymbol from "../parts/medical-symbol";

// The familiar Bangladeshi letterhead: medical symbol + doctor on the left, the chamber
// logo sitting right beside the chamber/contact block on the right (behind a hairline
// divider), so the logo reads as part of the chamber's identity. The Olive brand mark
// lives in the prescription footer, not here.
export default function ClassicSplitHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;
    const showContact = hasContactContent(config);

    return (
        <div>
            <div className="flex items-stretch gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    {config.showMedicalSymbol && (
                        <MedicalSymbol width={config.medicalSymbolWidth} height={config.medicalSymbolHeight} />
                    )}
                    <DoctorIdentityBlock identity={identity} config={config} palette={palette} />
                </div>

                {logoUrl && (
                    <div className="flex shrink-0 flex-col items-center justify-center">
                        <HeaderLogo url={logoUrl} isMono={palette.isMono} shape={config.logoShape} size={config.logoSize} />
                    </div>
                )}

                {showContact && (
                    <div className="flex shrink-0 flex-col items-end justify-center border-l border-slate-200 pl-4">
                        <ChamberContactBlock config={config} align="right" />
                    </div>
                )}
            </div>

            <HeaderAccentRule accent={palette.accent} className="mt-2.5" />
        </div>
    );
}
