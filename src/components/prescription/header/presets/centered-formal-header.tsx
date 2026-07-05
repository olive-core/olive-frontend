import type { HeaderRenderProps } from "../header-render-props";
import DoctorIdentityBlock from "../parts/doctor-identity-block";
import ChamberContactBlock from "../parts/chamber-contact-block";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import OliveBrandMark from "../parts/olive-brand-mark";

// Institutional letterhead: logo, doctor and contact all centered above a full-width rule.
export default function CenteredFormalHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;

    return (
        <div className="flex flex-col items-center pt-1 text-center">
            {logoUrl && <HeaderLogo url={logoUrl} isMono={palette.isMono} className="mb-2" />}

            <DoctorIdentityBlock identity={identity} config={config} palette={palette} align="center" />
            <ChamberContactBlock config={config} align="center" layout="inline" className="mt-1.5" />

            <HeaderAccentRule accent={palette.accent} className="mt-3 w-full" />

            {config.showOliveBrand && <OliveBrandMark isMono={palette.isMono} className="mt-1.5" />}
        </div>
    );
}
