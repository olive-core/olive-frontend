import { padPrintsLetterhead, type ChamberPad } from "@/lib/chamber-pad";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import type { Chamber } from "@/types/attendant-queue";

// Style, the doctor's details and the footer only ever reach paper as part of Olive's
// letterhead. A doctor whose every chamber runs on pre-printed stationery prints none of
// it, so the editor drops those sections rather than asking them to be filled in for
// nothing. A doctor with no chambers yet still prints Olive's letterhead, and so does a
// chamber whose pad has not loaded.
export function printsOliveLetterhead(chambers: Chamber[], pads: Record<string, ChamberPad>): boolean {
    return chambers.length === 0 || chambers.some((chamber) => {
        const pad = pads[chamber.chamber_id];
        return !pad || padPrintsLetterhead(pad);
    });
}

export function usePrintsOliveLetterhead(): boolean {
    return useHeaderConfigStore((state) => printsOliveLetterhead(state.chambers, state.pads));
}
