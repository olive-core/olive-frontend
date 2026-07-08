import type { ReactNode } from "react";

import { getHeaderPalette, type DoctorIdentity, type HeaderConfig, type HeaderPreset } from "@/lib/header-config";
import type { HeaderRenderProps } from "./header-render-props";
import ClassicSplitHeader from "./presets/classic-split-header";
import AccentBarHeader from "./presets/accent-bar-header";

const PRESET_RENDERERS: Record<HeaderPreset, (props: HeaderRenderProps) => ReactNode> = {
    "classic-split": ClassicSplitHeader,
    "accent-bar":    AccentBarHeader,
};

interface PrescriptionHeaderProps {
    identity: DoctorIdentity;
    config:   HeaderConfig;
}

// Renders the doctor's chosen letterhead preset with the color/monochrome palette applied.
export default function PrescriptionHeader({ identity, config }: PrescriptionHeaderProps) {
    const palette = getHeaderPalette(config);
    const Preset = PRESET_RENDERERS[config.preset] ?? ClassicSplitHeader;
    return <Preset identity={identity} config={config} palette={palette} />;
}
