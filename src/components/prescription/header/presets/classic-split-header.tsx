import type { HeaderRenderProps } from "../header-render-props";
import DoctorIdentityBlock from "../parts/doctor-identity-block";
import ChamberContactBlock from "../parts/chamber-contact-block";
import HeaderAccentRule from "../parts/header-accent-rule";
import HeaderLogo from "../parts/header-logo";
import OliveBrandMark from "../parts/olive-brand-mark";

// The familiar Bangladeshi letterhead: logo + doctor on the left, chamber/contact on the
// right, an accent rule underneath.
export default function ClassicSplitHeader({ identity, config, palette }: HeaderRenderProps) {
    const logoUrl = config.showLogo ? config.logoUrl : null;

    return (
        <div className="pt-1">
            {config.showOliveBrand && (
                <div className="mb-1 flex justify-end">
                    <OliveBrandMark isMono={palette.isMono} />
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                    {logoUrl && <HeaderLogo url={logoUrl} isMono={palette.isMono} />}
                    <DoctorIdentityBlock identity={identity} config={config} palette={palette} align="left" />
                </div>
                <ChamberContactBlock config={config} align="right" />
            </div>

            <HeaderAccentRule accent={palette.accent} withRxGlyph className="mt-3" />
        </div>
    );
}
