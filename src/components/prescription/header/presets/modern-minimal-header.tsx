import type { HeaderRenderProps } from "../header-render-props";
import DoctorIdentityBlock from "../parts/doctor-identity-block";
import ChamberContactBlock from "../parts/chamber-contact-block";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import OliveBrandMark from "../parts/olive-brand-mark";

// Clean, premium letterhead: name up top, a thin rule, then contact as one compact line.
export default function ModernMinimalHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;

    return (
        <div className="pt-1">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    {logoUrl && <HeaderLogo url={logoUrl} isMono={palette.isMono} className="h-12" />}
                    <DoctorIdentityBlock identity={identity} config={config} palette={palette} align="left" />
                </div>
                {config.showOliveBrand && <OliveBrandMark isMono={palette.isMono} />}
            </div>

            <HeaderAccentRule accent={palette.accent} className="my-2" />

            <ChamberContactBlock config={config} align="left" layout="inline" />
        </div>
    );
}
