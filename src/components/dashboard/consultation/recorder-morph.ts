import { useLayoutEffect, useRef } from "react";

// The recorder is one object drawn in two places: the card on the consultation screen and
// the floating widget everywhere else. Only one of them is ever on screen, so the arriving
// surface starts life at the departing one's position and size and settles into its own —
// the card folds down into the corner on the way out, and unfolds back out on return.
// The handover point is module state because the recording session is a singleton; there
// is no second recorder to key it by.

const MORPH_MS = 320;
const MORPH_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

let handoverRect: DOMRect | null = null;

/** Call before anything that moves or resizes the recorder, so it can animate from here. */
export function rememberRecorderRect(element: HTMLElement | null): void {
    if (element) handoverRect = element.getBoundingClientRect();
}

/** A finished session has nowhere to fly from: the next one's card simply appears. */
export function forgetRecorderRect(): void {
    handoverRect = null;
}

function takeHandoverRect(): DOMRect | null {
    const rect = handoverRect;
    handoverRect = null;
    return rect;
}

function prefersReducedMotion(): boolean {
    return typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function morphFrom(element: HTMLElement, from: DOMRect): void {
    const to = element.getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return;

    const offset = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
    const size = `scale(${from.width / to.width}, ${from.height / to.height})`;

    element.animate(
        [
            { transformOrigin: "top left", transform: `${offset} ${size}`, opacity: 0.35 },
            { transformOrigin: "top left", transform: "none", opacity: 1 },
        ],
        { duration: MORPH_MS, easing: MORPH_EASING },
    );
}

// `shape` names the layout the surface is currently drawn in; changing it replays the
// morph, which is what animates the floating widget collapsing to its pill and back.
export function useRecorderMorph<T extends HTMLElement>(shape: string) {
    const ref = useRef<T>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        const from = takeHandoverRect();
        if (element && from && typeof element.animate === "function" && !prefersReducedMotion()) {
            morphFrom(element, from);
        }
    }, [shape]);

    // Empty deps on purpose: this must fire only when the surface actually leaves the
    // screen, never on a shape change (where the rect is captured before the DOM moves).
    useLayoutEffect(() => () => rememberRecorderRect(ref.current), []);

    return ref;
}
