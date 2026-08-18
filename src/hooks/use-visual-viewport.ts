import { useEffect, useState } from "react";

export interface VisualViewportBox {
    /** Height of the area the clinician can actually see right now. */
    visibleHeight: number;
    /** Layout-viewport pixels hidden below that area — on a phone, the on-screen keyboard. */
    bottomInset:   number;
}

interface ViewportMetrics {
    height:    number;
    offsetTop: number;
}

// Pure, so the keyboard arithmetic can be checked without a browser.
export function visualViewportBox(viewport: ViewportMetrics, layoutHeight: number): VisualViewportBox {
    return {
        visibleHeight: Math.round(viewport.height),
        bottomInset:   Math.max(0, Math.round(layoutHeight - (viewport.height + viewport.offsetTop))),
    };
}

// The on-screen keyboard never moves `position: fixed` on iOS and only sometimes does on
// Android, so a panel pinned to the bottom of the screen has to be told where the bottom
// currently is. Null until measured, and on browsers without the API — callers fall back
// to plain viewport units there.
export function useVisualViewport(): VisualViewportBox | null {
    const [box, setBox] = useState<VisualViewportBox | null>(null);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const sync = () => setBox(visualViewportBox(viewport, document.documentElement.clientHeight));

        sync();
        viewport.addEventListener("resize", sync);
        viewport.addEventListener("scroll", sync);
        return () => {
            viewport.removeEventListener("resize", sync);
            viewport.removeEventListener("scroll", sync);
        };
    }, []);

    return box;
}
