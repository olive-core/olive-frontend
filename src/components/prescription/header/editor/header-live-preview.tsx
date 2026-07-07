import { MousePointerClickIcon } from "lucide-react";

import type { HeaderColorMode } from "@/lib/header-config";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import PrescriptionHeader from "../prescription-header";
import { SegmentedControl } from "./controls/control-primitives";
import { focusKeyFromEvent, focusControl } from "./focus-field";

const COLOR_MODE_OPTIONS: { value: HeaderColorMode; label: string }[] = [
    { value: "color", label: "Color" },
    { value: "mono",  label: "B & W" },
];

// The pinned, print-faithful preview: the paper is exactly the prescription page's width
// (210mm, p-6 — mirroring print-view) so wrapping matches print, and it scrolls
// horizontally on narrow screens instead of reflowing. Clicking any labelled region jumps
// to that field's control below.
export default function HeaderLivePreview() {
    const identity = useHeaderConfigStore((state) => state.identity);
    const config = useHeaderConfigStore((state) => state.config);
    const patch = useHeaderConfigStore((state) => state.patch);

    const handleClick = (event: React.MouseEvent) => {
        const key = focusKeyFromEvent(event.target);
        if (key) focusControl(key);
    };

    return (
        <div className="rounded-xl border bg-slate-200/50 p-2.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MousePointerClickIcon className="size-3.5" />
                    Click any text on the paper to edit it
                </span>
                <SegmentedControl
                    value={config.colorMode}
                    options={COLOR_MODE_OPTIONS}
                    onChange={(colorMode) => patch({ colorMode })}
                />
            </div>

            <div className="overflow-x-auto rounded-md">
                <div
                    onClick={handleClick}
                    className="mx-auto w-[210mm] shrink-0 bg-white p-6 pb-4 shadow-[0_1px_4px_rgba(15,23,42,0.12)] ring-1 ring-black/5 [&_[data-focus]]:cursor-pointer [&_[data-focus]]:rounded-sm [&_[data-focus]:hover]:outline-2 [&_[data-focus]:hover]:outline-offset-2 [&_[data-focus]:hover]:outline-emerald-300"
                >
                    <PrescriptionHeader identity={identity} config={config} />

                    <div className="mt-3 flex h-14 items-center justify-center rounded border border-dashed border-slate-200">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                            Prescription area
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
