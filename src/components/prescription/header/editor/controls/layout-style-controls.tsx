import { useHeaderConfigStore } from "@/stores/header-config-store";
import { ACCENT_SWATCHES, HEADER_PRESETS, type HeaderColorMode, type HeaderPreset } from "@/lib/header-config";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ui/color-picker";
import { ControlSection, SegmentedControl, ToggleRow } from "./control-primitives";

const COLOR_MODE_OPTIONS: { value: HeaderColorMode; label: string }[] = [
    { value: "color", label: "Color" },
    { value: "mono",  label: "Black & white" },
];

export default function LayoutStyleControls() {
    const config = useHeaderConfigStore((state) => state.config);
    const patch = useHeaderConfigStore((state) => state.patch);

    return (
        <ControlSection title="Layout & style" description="Pick a layout and the brand look.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {HEADER_PRESETS.map((preset) => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => patch({ preset: preset.value as HeaderPreset })}
                        className={cn(
                            "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                            config.preset === preset.value
                                ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30"
                                : "border-slate-200 hover:border-slate-300",
                        )}
                    >
                        <span className="text-sm font-semibold text-slate-800">{preset.label}</span>
                        <span className="text-xs text-slate-400">{preset.description}</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500">Accent color</span>
                    <ColorPicker
                        value={config.accentColor}
                        onChange={(accentColor) => patch({ accentColor })}
                        swatches={ACCENT_SWATCHES}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500">Print mode</span>
                    <SegmentedControl
                        value={config.colorMode}
                        options={COLOR_MODE_OPTIONS}
                        onChange={(colorMode) => patch({ colorMode })}
                    />
                </div>
            </div>

            <ToggleRow
                label="Show center logo"
                checked={config.showLogo}
                onChange={(showLogo) => patch({ showLogo })}
            />
            <ToggleRow
                label="Show Olive brand mark"
                description="A subtle 'Powered by Olive' tag."
                checked={config.showOliveBrand}
                onChange={(showOliveBrand) => patch({ showOliveBrand })}
            />
        </ControlSection>
    );
}
