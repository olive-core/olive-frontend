import { hasContactContent } from "@/lib/header-config";
import type { HeaderRenderProps } from "../header-render-props";
import DoctorIdentityBlock from "../parts/doctor-identity-block";
import ChamberContactBlock from "../parts/chamber-contact-block";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import MedicalSymbol from "../parts/medical-symbol";
import OliveBrandMark from "../parts/olive-brand-mark";

// Modern letterhead: a slim vertical accent bar flanks the doctor block (printing as a
// crisp black bar in mono), both brand marks sit centered in the middle, and the chamber
// reads as a small-caps line above the right-aligned contact over a quiet hairline.
export default function AccentBarHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;
    const showContact = hasContactContent(config);
    const showBrandColumn = Boolean(logoUrl) || config.showOliveBrand;

    return (
        <div>
            <div className="flex items-stretch gap-3">
                <div className="w-[4px] shrink-0 self-stretch rounded-full" style={{ backgroundColor: palette.accent }} />

                <div className="flex min-w-0 items-center gap-2.5">
                    {config.showMedicalSymbol && (
                        <MedicalSymbol width={config.medicalSymbolWidth} height={config.medicalSymbolHeight} />
                    )}
                    <DoctorIdentityBlock identity={identity} config={config} palette={palette} />
                </div>

                {showBrandColumn && (
                    <div className="mx-auto flex shrink-0 flex-col items-center justify-center gap-1.5 px-3">
                        {logoUrl && (
                            <HeaderLogo url={logoUrl} isMono={palette.isMono} shape={config.logoShape} size={config.logoSize} />
                        )}
                        {config.showOliveBrand && <OliveBrandMark isMono={palette.isMono} />}
                    </div>
                )}

                {showContact && (
                    <div className={`flex shrink-0 flex-col items-end justify-center gap-1 ${showBrandColumn ? "" : "ml-auto"}`}>
                        {config.chamberName.trim() && (
                            <span
                                data-focus="chamberName"
                                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                            >
                                {config.chamberName}
                            </span>
                        )}
                        <ChamberContactBlock config={config} align="right" showChamberName={false} />
                    </div>
                )}
            </div>

            <HeaderAccentRule accent={palette.accent} variant="hairline" className="mt-2.5" />
        </div>
    );
}
