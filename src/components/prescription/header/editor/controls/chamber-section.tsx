import { Link } from "@tanstack/react-router";
import { UsersIcon } from "lucide-react";

import { padStateIsConfigured } from "@/lib/chamber-pad";
import { chamberLabel, chamberRoom, type Chamber } from "@/types/attendant-queue";
import { chamberSectionId, useHeaderConfigStore } from "@/stores/header-config-store";
import PadSection from "../pad-section";
import { CHAMBER_SECTION_ICON, chamberSectionSummary } from "../pad-sections";
import { controlId } from "../focus-field";
import { usePrintsOliveLetterhead } from "../letterhead-scope";
import ChamberPadFields from "../../../chamber-pad-fields";
import DeleteChamberControl from "./delete-chamber-control";

function UnsavedBadge() {
    return (
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
            Unsaved
        </span>
    );
}

// One chamber's whole pad, as a top-level section of the editor. The chamber is the unit a
// doctor thinks in — one place, one pad — so it is never nested behind another list.
export default function ChamberSection({ chamber }: { chamber: Chamber }) {
    const pad = useHeaderConfigStore((state) => state.pads[chamber.chamber_id]);
    const patchPad = useHeaderConfigStore((state) => state.patchPad);
    const isDirty = useHeaderConfigStore((state) => state.dirtyPadIds.includes(chamber.chamber_id));
    const printsLetterhead = usePrintsOliveLetterhead();

    if (!pad) return null;

    const id = chamber.chamber_id;
    const room = chamberRoom(chamber);
    const name = pad.displayName.trim() || chamberLabel(chamber);

    return (
        <PadSection
            id={chamberSectionId(id)}
            icon={CHAMBER_SECTION_ICON}
            title={room ? `${name} · ${room}` : name}
            summary={chamberSectionSummary(pad)}
            needsAttention={!padStateIsConfigured(pad)}
            badge={isDirty ? <UnsavedBadge /> : undefined}
        >
            <ChamberPadFields
                chamberId={id}
                chamberLabel={chamberLabel(chamber)}
                pad={pad}
                printsLetterhead={printsLetterhead}
                onChange={(patch) => patchPad(id, patch)}
                nameFieldId={controlId(`pad-${id}-name`)}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <Link
                    to="/doctor/chambers"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
                >
                    <UsersIcon className="size-3.5" />
                    Attendants for this chamber
                </Link>
                <DeleteChamberControl chamber={chamber} />
            </div>
        </PadSection>
    );
}
