import { useHeaderConfigStore } from "@/stores/header-config-store";
import {
    ACCENT_SWATCHES,
    clampLogoSize,
    clampSymbolSize,
    HEADER_PRESETS,
    MAX_LOGO_SIZE,
    MAX_SYMBOL_SIZE,
    MIN_LOGO_SIZE,
    MIN_SYMBOL_SIZE,
    type HeaderColorMode,
    type HeaderPreset,
    type LogoShape,
} from "@/lib/header-config";
import { cn } from "@/lib/utils";
import { ColorPicker } from "@/components/ui/color-picker";
import { controlId } from "../focus-field";
import { SegmentedControl, ToggleRow } from "./control-primitives";

function SymbolSizeSlider({ id, label, value, onChange }: {
    id?:      string;
    label:    string;
    value:    number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="flex items-center gap-3">
            <span className="w-12 text-xs font-medium text-slate-500">{label}</span>
            <input
                id={id}
                type="range"
                min={MIN_SYMBOL_SIZE}
                max={MAX_SYMBOL_SIZE}
                step={2}
                value={value}
                onChange={(event) => onChange(clampSymbolSize(Number(event.target.value)))}
                className="h-2.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500 sm:h-1.5"
            />
            <span className="w-12 text-right text-xs tabular-nums text-slate-400">{value}px</span>
        </label>
    );
}

const COLOR_MODE_OPTIONS: { value: HeaderColorMode; label: string }[] = [
    { value: "color", label: "Color" },
    { value: "mono",  label: "Black & white" },
];

const LOGO_SHAPES: { value: LogoShape; label: string; frameClass: string }[] = [
    { value: "circle",  label: "Circle",  frameClass: "rounded-full" },
    { value: "rounded", label: "Rounded", frameClass: "rounded-md" },
    { value: "square",  label: "Square",  frameClass: "rounded-none" },
];

function LogoShapePicker({ value, onChange }: { value: LogoShape; onChange: (shape: LogoShape) => void }) {
    return (
        <div className="flex items-center gap-1.5">
            {LOGO_SHAPES.map((shape) => (
                <button
                    key={shape.value}
                    type="button"
                    title={shape.label}
                    aria-label={`${shape.label} logo frame`}
                    onClick={() => onChange(shape.value)}
                    className={cn(
                        "flex size-11 items-center justify-center rounded-lg border transition-colors sm:size-9",
                        value === shape.value
                            ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30"
                            : "border-slate-200 hover:border-slate-300",
                    )}
                >
                    <span className={cn("size-5 border-[1.5px] border-slate-400", shape.frameClass)} />
                </button>
            ))}
        </div>
    );
}

function ThumbLine({ width, muted }: { width: string; muted?: boolean }) {
    return <div className={cn("h-1 rounded-full", muted ? "bg-slate-200" : "bg-slate-300")} style={{ width }} />;
}

// A tiny wireframe of each layout so the doctor recognises it at a glance instead of reading.
function PresetThumb({ preset, accent }: { preset: HeaderPreset; accent: string }) {
    if (preset === "classic-split") {
        return (
            <div className="flex h-11 flex-col gap-1">
                <div className="flex flex-1 items-center gap-1.5">
                    <div className="flex flex-1 flex-col gap-1">
                        <ThumbLine width="75%" />
                        <ThumbLine width="55%" muted />
                        <ThumbLine width="40%" muted />
                    </div>
                    <div className="w-px self-stretch bg-slate-200" />
                    <div className="flex flex-1 flex-col items-end gap-1">
                        <ThumbLine width="65%" muted />
                        <ThumbLine width="50%" muted />
                    </div>
                </div>
                <div className="h-[3px] rounded-full" style={{ backgroundColor: accent }} />
            </div>
        );
    }

    return (
        <div className="flex h-11 flex-col gap-1">
            <div className="flex flex-1 gap-1.5">
                <div className="w-[3px] self-stretch rounded-full" style={{ backgroundColor: accent }} />
                <div className="flex flex-1 flex-col justify-center gap-1">
                    <ThumbLine width="70%" />
                    <ThumbLine width="50%" muted />
                </div>
                <div className="flex flex-1 flex-col items-end justify-center gap-1">
                    <ThumbLine width="55%" muted />
                    <ThumbLine width="40%" muted />
                </div>
            </div>
            <div className="h-px bg-slate-200" />
        </div>
    );
}

export default function LayoutStyleControls() {
    const config = useHeaderConfigStore((state) => state.config);
    const patch = useHeaderConfigStore((state) => state.patch);

    return (
        <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {HEADER_PRESETS.map((preset) => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => patch({ preset: preset.value })}
                        className={cn(
                            "flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-all",
                            config.preset === preset.value
                                ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30"
                                : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
                        )}
                    >
                        <PresetThumb preset={preset.value} accent={config.accentColor} />
                        <div>
                            <span className="text-xs font-semibold text-slate-800">{preset.label}</span>
                            <p className="text-[10px] text-slate-400">{preset.description}</p>
                        </div>
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
                    <span className="text-xs font-medium text-slate-500">Printing</span>
                    <SegmentedControl
                        value={config.colorMode}
                        options={COLOR_MODE_OPTIONS}
                        onChange={(colorMode) => patch({ colorMode })}
                    />
                </div>
            </div>

            <ToggleRow
                label="Show chamber logo"
                description="Uploaded per chamber, in that chamber's section above."
                checked={config.showLogo}
                onChange={(showLogo) => patch({ showLogo })}
            />
            {config.showLogo && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-slate-500">Frame</span>
                        <LogoShapePicker value={config.logoShape} onChange={(logoShape) => patch({ logoShape })} />
                    </div>
                    <label className="flex min-w-44 flex-1 flex-col gap-1.5">
                        <span className="text-xs font-medium text-slate-500">Size</span>
                        <span className="flex items-center gap-3">
                            <input
                                id={controlId("logo")}
                                type="range"
                                min={MIN_LOGO_SIZE}
                                max={MAX_LOGO_SIZE}
                                step={2}
                                value={config.logoSize}
                                onChange={(event) => patch({ logoSize: clampLogoSize(Number(event.target.value)) })}
                                className="h-2.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500 sm:h-1.5"
                            />
                            <span className="w-12 text-right text-xs tabular-nums text-slate-400">{config.logoSize}px</span>
                        </span>
                    </label>
                </div>
            )}
            <ToggleRow
                label="Show medical symbol"
                description="The caduceus mark beside the doctor's name."
                checked={config.showMedicalSymbol}
                onChange={(showMedicalSymbol) => patch({ showMedicalSymbol })}
            />
            {config.showMedicalSymbol && (
                <div className="flex flex-col gap-2 pl-4">
                    <SymbolSizeSlider
                        id={controlId("medicalSymbol")}
                        label="Width"
                        value={config.medicalSymbolWidth}
                        onChange={(medicalSymbolWidth) => patch({ medicalSymbolWidth })}
                    />
                    <SymbolSizeSlider
                        label="Height"
                        value={config.medicalSymbolHeight}
                        onChange={(medicalSymbolHeight) => patch({ medicalSymbolHeight })}
                    />
                </div>
            )}
        </div>
    );
}
