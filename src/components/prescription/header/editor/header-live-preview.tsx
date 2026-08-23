import { useEffect, useRef, useState } from "react";
import { MousePointerClickIcon } from "lucide-react";

import { applyPadState, buildFooterFromPadStates, padDisplayName } from "@/lib/chamber-pad";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { cn } from "@/lib/utils";
import { isPrePrinted } from "@/lib/print-paper";
import PrescriptionHeader from "../prescription-header";
import PrescriptionFooter from "../../footer/prescription-footer";
import PrePrintedPaperPreview from "../../paper/preprinted-paper-preview";
import { SegmentedControl } from "./controls/control-primitives";
import { PAPER_PX, previewFit, type PreviewZoom } from "./preview-zoom";
import { focusKeyFromEvent, focusControl } from "./focus-field";

const ZOOM_OPTIONS: { value: PreviewZoom; label: string }[] = [
    { value: "fit",    label: "Fit" },
    { value: "actual", label: "Actual size" },
];

// Neutral editor-only stand-in shown in the logo frame before a chamber logo is uploaded.
const LOGO_PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>" +
    "<rect width='96' height='96' fill='#f1f5f9'/>" +
    "<text x='48' y='53' font-family='sans-serif' font-size='14' font-weight='600' fill='#94a3b8' text-anchor='middle'>LOGO</text>" +
    "</svg>",
);

// Chamber-context pills: the preview renders "as if" the prescription were written at
// the selected chamber — its pad in the header, the other chambers in the footer.
function ChamberPills() {
    const chambers = useHeaderConfigStore((state) => state.chambers);
    const pads = useHeaderConfigStore((state) => state.pads);
    const previewChamberId = useHeaderConfigStore((state) => state.previewChamberId);
    const setPreviewChamber = useHeaderConfigStore((state) => state.setPreviewChamber);

    if (chambers.length === 0) return null;

    const options: { id: string | null; label: string }[] = [
        { id: null, label: "No chamber selected" },
        ...chambers.map((chamber) => ({
            id: chamber.chamber_id,
            label: pads[chamber.chamber_id]?.displayName.trim() || padDisplayName(chamber),
        })),
    ];

    // Roving arrow-key selection so the pill row behaves like a radio group.
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const index = options.findIndex((option) => option.id === previewChamberId);
        const delta = event.key === "ArrowRight" ? 1 : -1;
        const next = options[(index + delta + options.length) % options.length];
        setPreviewChamber(next.id);
    };

    return (
        <div
            role="radiogroup"
            aria-label="Preview as chamber"
            onKeyDown={handleKeyDown}
            className="mb-2 flex flex-wrap items-center gap-1.5 px-1"
        >
            {options.map((option) => {
                const isActive = option.id === previewChamberId;
                return (
                    <button
                        key={option.id ?? "personal"}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setPreviewChamber(option.id)}
                        className={cn(
                            "min-h-9 max-w-[180px] truncate rounded-full border px-3 text-xs font-medium transition-colors sm:min-h-0 sm:py-1",
                            isActive
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

// The pinned, print-faithful preview: the paper lays out at exactly the prescription
// page's width (210mm, p-6 — mirroring print-view) so wrapping matches print, and it
// scales down to fit the pane instead of scrolling. Clicking any labelled region jumps
// to that field's control.
export default function HeaderLivePreview({ onEditRequest }: { onEditRequest?: () => void }) {
    const identity = useHeaderConfigStore((state) => state.identity);
    const config = useHeaderConfigStore((state) => state.config);
    const chambers = useHeaderConfigStore((state) => state.chambers);
    const pads = useHeaderConfigStore((state) => state.pads);
    const previewChamberId = useHeaderConfigStore((state) => state.previewChamberId);

    const containerRef = useRef<HTMLDivElement>(null);
    const paperRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<PreviewZoom>("fit");
    const [box, setBox] = useState({ paneWidth: 0, paperHeight: 0 });

    // Track both the pane width (drag-resizes, phone rotation) and the paper height
    // (content edits) so the scaled wrapper never clips or leaves dead space. The paper
    // is transformed, not resized, so offsetHeight stays the unscaled height.
    useEffect(() => {
        const measure = () => setBox({
            paneWidth:   containerRef.current?.clientWidth ?? 0,
            paperHeight: paperRef.current?.offsetHeight ?? 0,
        });
        measure();
        const observer = new ResizeObserver(measure);
        if (containerRef.current) observer.observe(containerRef.current);
        if (paperRef.current) observer.observe(paperRef.current);
        return () => observer.disconnect();
    }, []);

    const { canZoom, scale } = previewFit(box.paneWidth, zoom);
    const isActualSize = scale === 1 && canZoom;
    const boxHeight = box.paperHeight > 0 ? box.paperHeight * scale : undefined;

    // Tapping a region of the paper jumps to the field behind it. On a phone the preview
    // is a sheet over the form, so it has to step aside before the field can be reached.
    const handleClick = (event: React.MouseEvent) => {
        const key = focusKeyFromEvent(event.target);
        if (!key) return;
        onEditRequest?.();
        focusControl(key);
    };

    // Resolve the preview context: the selected chamber's pad overlays the style
    // config's chamber fields; the footer shows the remaining chambers. When no logo is
    // uploaded yet, a stand-in image keeps the frame visible so shape/size clicks give
    // instant feedback — real prints render nothing until a chamber logo exists.
    const previewChamber = chambers.find((chamber) => chamber.chamber_id === previewChamberId) ?? null;
    const previewPad = previewChamber ? pads[previewChamber.chamber_id] : null;

    // Nothing of the letterhead prints on a pre-printed pad, so the preview becomes the
    // measurement it is actually about: where the prescription lands on the doctor's own
    // stationery.
    if (previewPad && isPrePrinted(previewPad.paper)) {
        return (
            <div className="rounded-xl border bg-slate-200/50 p-2.5 shadow-sm">
                <ChamberPills />
                <div className="flex flex-col items-center gap-3 rounded-md bg-white p-4">
                    <PrePrintedPaperPreview paper={previewPad.paper} heightPx={300} />
                    <p className="max-w-[44ch] text-center text-[11px] text-slate-400">
                        Prescriptions written at this chamber print into the clear area only — your
                        pad already carries the header and footer.
                    </p>
                </div>
            </div>
        );
    }

    const resolvedConfig = previewChamber && previewPad
        ? applyPadState(config, previewChamber, previewPad)
        : config;
    const previewConfig = resolvedConfig.showLogo && !resolvedConfig.logoUrl
        ? { ...resolvedConfig, logoUrl: LOGO_PLACEHOLDER }
        : resolvedConfig;
    const footer = buildFooterFromPadStates(chambers, pads, previewChamber?.chamber_id ?? null);

    return (
        <div className="rounded-xl border bg-slate-200/50 p-2.5 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-1">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MousePointerClickIcon className="size-3.5" />
                    Tap any text on the paper to edit it
                </span>
                {canZoom && (
                    <SegmentedControl value={zoom} options={ZOOM_OPTIONS} onChange={setZoom} />
                )}
            </div>

            <ChamberPills />

            <div
                ref={containerRef}
                className={cn("rounded-md", isActualSize ? "overflow-auto" : "overflow-hidden")}
                style={{ height: boxHeight }}
            >
                <div
                    ref={paperRef}
                    onClick={handleClick}
                    style={{ width: PAPER_PX, transform: `scale(${scale})`, transformOrigin: "top left" }}
                    className="flex flex-col bg-white p-6 pb-4 shadow-[0_1px_4px_rgba(15,23,42,0.12)] ring-1 ring-black/5 [&_[data-focus]]:cursor-pointer [&_[data-focus]]:rounded-sm [&_[data-focus]:hover]:outline-2 [&_[data-focus]:hover]:outline-offset-2 [&_[data-focus]:hover]:outline-emerald-300"
                >
                    <PrescriptionHeader identity={identity} config={previewConfig} />

                    <div className="mt-3 flex h-14 items-center justify-center rounded border border-dashed border-slate-200">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                            Prescription area
                        </span>
                    </div>

                    <PrescriptionFooter footer={footer} config={previewConfig} className="mt-3" />
                </div>
            </div>
        </div>
    );
}
