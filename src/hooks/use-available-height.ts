import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

// Keeps the panel clear of whatever edge stops it, and never collapses it to a peephole even
// when the field is measured mid-scroll.
const EDGE_MARGIN_PX = 12;
const MIN_HEIGHT_PX   = 180;

// Pure, so the arithmetic can be checked without a browser.
export function availableHeightBelow(anchorBottom: number, containerBottom: number, viewportBottom: number): number {
    const room = Math.min(containerBottom, viewportBottom) - anchorBottom - EDGE_MARGIN_PX;
    return Math.max(MIN_HEIGHT_PX, Math.round(room));
}

function scrollParentOf(element: HTMLElement): HTMLElement | null {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const overflowY = getComputedStyle(parent).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") return parent;
    }
    return null;
}

// How tall a panel opening under `anchor` may be before it runs past the bottom of whatever
// is clipping it — inside the phone edit sheet, that is the sheet's scroll area, whose height
// no CSS unit can name — or past the top of the on-screen keyboard. Null when disabled and
// until measured; callers fall back to their CSS cap there.
export function useAvailableHeightBelow(anchorRef: RefObject<HTMLElement | null>, enabled: boolean): number | null {
    const [height, setHeight] = useState<number | null>(null);
    const scrollParent = useRef<HTMLElement | null>(null);

    const measure = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const viewport = window.visualViewport;
        setHeight(availableHeightBelow(
            anchor.getBoundingClientRect().bottom,
            scrollParent.current?.getBoundingClientRect().bottom ?? Infinity,
            viewport ? viewport.offsetTop + viewport.height : window.innerHeight,
        ));
    }, [anchorRef]);

    useEffect(() => {
        if (!enabled) {
            setHeight(null);
            return;
        }

        scrollParent.current = anchorRef.current ? scrollParentOf(anchorRef.current) : null;
        measure();

        // Capture phase: the sheet's own scroll area does not bubble its scroll events, and
        // the field is lifted to the top of it as the panel opens.
        window.addEventListener("scroll", measure, true);
        window.addEventListener("resize", measure);
        window.visualViewport?.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("scroll", measure, true);
            window.removeEventListener("resize", measure);
            window.visualViewport?.removeEventListener("resize", measure);
        };
    }, [enabled, measure, anchorRef]);

    return height;
}
