import { useCallback, useEffect, useRef, useState } from "react";

// Tracks whether a scroll container has hidden content above/below, so a UI can fade those edges
// to signal scrollability. Recomputes on scroll and whenever the viewport or content resizes.
export function useScrollFade() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [hasContentAbove, setHasContentAbove] = useState(false);
    const [hasContentBelow, setHasContentBelow] = useState(false);

    const recompute = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setHasContentAbove(el.scrollTop > 4);
        setHasContentBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    }, []);

    useEffect(() => {
        recompute();
        const observer = new ResizeObserver(recompute);
        if (scrollRef.current) observer.observe(scrollRef.current);
        if (contentRef.current) observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [recompute]);

    return { scrollRef, contentRef, hasContentAbove, hasContentBelow, onScroll: recompute };
}
