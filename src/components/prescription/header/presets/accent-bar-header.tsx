import { hasContactContent } from "@/lib/header-config";
import type { HeaderRenderProps } from "../header-render-props";
import DoctorIdentityBlock from "../parts/doctor-identity-block";
import ChamberContactBlock from "../parts/chamber-contact-block";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import MedicalSymbol from "../parts/medical-symbol";

// Modern letterhead: a slim vertical accent bar flanks the doctor block (printing as a
// crisp black bar in mono), the chamber logo sits on the right next to the chamber
// block — a small-caps line above the right-aligned contact over a quiet hairline. The
// Olive brand mark lives in the prescription footer, not here.
export default function AccentBarHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;
    const showContact = hasContactContent(config);
    const showBrandColumn = Boolean(logoUrl);

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
                    <div className="ml-auto flex shrink-0 flex-col items-center justify-center px-3">
                        {logoUrl && (
                            <HeaderLogo url={logoUrl} isMono={palette.isMono} shape={config.logoShape} size={config.logoSize} />
                        )}
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
