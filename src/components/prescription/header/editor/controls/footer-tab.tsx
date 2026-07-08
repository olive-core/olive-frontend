import { Reorder, useDragControls } from "motion/react";
import { Building2, GripVerticalIcon, PanelBottomIcon } from "lucide-react";
import toast from "react-hot-toast";

import { MAX_FOOTER_CHAMBERS, padDisplayName } from "@/lib/chamber-pad";
import { chamberRoom, type Chamber } from "@/types/attendant-queue";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { cn } from "@/lib/utils";
import { controlId } from "../focus-field";
import { ControlSection } from "./control-primitives";

function FooterChamberRow({ chamber }: { chamber: Chamber }) {
    const pad = useHeaderConfigStore((state) => state.pads[chamber.chamber_id]);
    const pads = useHeaderConfigStore((state) => state.pads);
    const patchPad = useHeaderConfigStore((state) => state.patchPad);
    const dragControls = useDragControls();

    if (!pad) return null;
    const room = chamberRoom(chamber);
    const enabledCount = Object.values(pads).filter((p) => p.showInFooter).length;

    const toggle = (next: boolean) => {
        if (next && enabledCount >= MAX_FOOTER_CHAMBERS) {
            toast.error(`The footer fits ${MAX_FOOTER_CHAMBERS} chambers — switch one off first.`);
            return;
        }
        patchPad(chamber.chamber_id, { showInFooter: next });
    };

    return (
        <Reorder.Item
            as="div"
            value={chamber}
            dragListener={false}
            dragControls={dragControls}
            data-contact-row
            className={cn(
                "flex items-center gap-2 rounded-lg border bg-white p-2.5",
                !pad.showInFooter && "opacity-60",
            )}
        >
            <button
                type="button"
                aria-label="Drag to reorder"
                onPointerDown={(event) => dragControls.start(event)}
                className="cursor-grab touch-none rounded p-1 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
            >
                <GripVerticalIcon className="size-4" />
            </button>
            <Building2 className="size-4 shrink-0 text-slate-400" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                {padDisplayName(chamber)}
                {room && <span className="ml-1.5 text-xs font-normal text-slate-400">{room}</span>}
            </span>
            <button
                id={controlId(`footer-chamber-${chamber.chamber_id}`)}
                type="button"
                role="switch"
                aria-checked={pad.showInFooter}
                aria-label={`Show ${padDisplayName(chamber)} in the footer`}
                onClick={() => toggle(!pad.showInFooter)}
                className={cn(
                    "flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition",
                    pad.showInFooter ? "bg-emerald-500" : "bg-slate-300",
                )}
            >
                <div className={cn("size-4 rounded-full bg-white shadow-md transition", pad.showInFooter ? "translate-x-5" : "translate-x-0")} />
            </button>
        </Reorder.Item>
    );
}

// What prints at the bottom of the page: the doctor's other chambers (so patients can
// find them elsewhere) and the Olive brand mark. Order here is footer order.
export default function FooterTab() {
    const chambers = useHeaderConfigStore((state) => state.chambers);
    const pads = useHeaderConfigStore((state) => state.pads);
    const patchPad = useHeaderConfigStore((state) => state.patchPad);

    // Present chambers in footer order (unset orders keep their chamber-list position).
    const ordered = [...chambers].sort((a, b) => {
        const orderA = pads[a.chamber_id]?.footerOrder ?? null;
        const orderB = pads[b.chamber_id]?.footerOrder ?? null;
        if (orderA === null && orderB === null) return 0;
        if (orderA === null) return 1;
        if (orderB === null) return -1;
        return orderA - orderB;
    });

    const handleReorder = (next: Chamber[]) => {
        next.forEach((chamber, index) => {
            if (pads[chamber.chamber_id]?.footerOrder !== index) {
                patchPad(chamber.chamber_id, { footerOrder: index });
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <ControlSection
                title="Footer"
                description="Printed at the bottom of every prescription."
                icon={PanelBottomIcon}
            >
                <p className="text-xs text-slate-400">
                    Every pad carries the "Powered by Olive" mark at the bottom right.
                </p>

                {chambers.length > 1 && (
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-medium text-slate-500">
                            Other chambers on the pad
                            <span className="ml-1.5 font-normal text-slate-400">
                                (max {MAX_FOOTER_CHAMBERS} — a prescription's own chamber is never repeated)
                            </span>
                        </p>
                        <Reorder.Group as="div" axis="y" values={ordered} onReorder={handleReorder} className="flex flex-col gap-1.5">
                            {ordered.map((chamber) => (
                                <FooterChamberRow key={chamber.chamber_id} chamber={chamber} />
                            ))}
                        </Reorder.Group>
                    </div>
                )}
                {chambers.length <= 1 && (
                    <p className="text-xs text-slate-400">
                        Add more chambers to cross-reference them in the footer — patients seeing
                        you at one chamber will know where else to find you.
                    </p>
                )}
            </ControlSection>
        </div>
    );
}
