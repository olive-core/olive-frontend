import { useEffect, useRef, type RefObject } from "react";

// The type / route / unit pickers are Radix popovers, which render in a portal outside the
// card. Without this, clicking one of their options counts as a click outside and commits
// the edit mid-selection.
const PORTAL_SELECTOR = "[data-radix-popper-content-wrapper]";

// Commits an open inline editor when the next click lands outside it. Committing rather than
// discarding is deliberate: an accidental click must never cost the clinician what they typed,
// which is what an explicit Cancel is for.
//
// Listens for `pointerdown`, not `mousedown`: iOS Safari fires no mouse event at all when a
// tap lands on plain, non-interactive markup, so tapping the paper beside an open editor
// left it stuck open on an iPhone.
export function useCommitOnClickOutside(ref: RefObject<HTMLElement | null>, commit: () => void) {
    const latestCommit = useRef(commit);

    useEffect(() => {
        latestCommit.current = commit;
    });

    useEffect(() => {
        const commitIfOutside = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target?.isConnected) return;
            if (ref.current?.contains(target) || target.closest(PORTAL_SELECTOR)) return;
            latestCommit.current();
        };

        document.addEventListener("pointerdown", commitIfOutside);
        return () => document.removeEventListener("pointerdown", commitIfOutside);
    }, [ref]);
}
