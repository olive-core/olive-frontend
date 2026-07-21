import { useEffect, useRef, type RefObject } from "react";

// The type / route / unit pickers are Radix popovers, which render in a portal outside the
// card. Without this, clicking one of their options counts as a click outside and commits
// the edit mid-selection.
const PORTAL_SELECTOR = "[data-radix-popper-content-wrapper]";

// Commits an open inline editor when the next click lands outside it. Committing rather than
// discarding is deliberate: an accidental click must never cost the clinician what they typed,
// which is what an explicit Cancel is for.
export function useCommitOnClickOutside(ref: RefObject<HTMLElement | null>, commit: () => void) {
    const latestCommit = useRef(commit);

    useEffect(() => {
        latestCommit.current = commit;
    });

    useEffect(() => {
        const commitIfOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target?.isConnected) return;
            if (ref.current?.contains(target) || target.closest(PORTAL_SELECTOR)) return;
            latestCommit.current();
        };

        document.addEventListener("mousedown", commitIfOutside);
        return () => document.removeEventListener("mousedown", commitIfOutside);
    }, [ref]);
}
