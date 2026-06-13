import { useScrollFade } from "@/hooks/use-scroll-fade";
import { cn } from "@/lib/utils";

interface ScrollFadeProps {
    children: React.ReactNode;
    className?: string;
}

// A vertical scroll area that fades its top/bottom edges when content is hidden there, hinting
// the list is scrollable before the user interacts. Fills its flex parent; pass `className` to
// style the inner scroll surface (e.g. padding).
export default function ScrollFade({ children, className }: ScrollFadeProps) {
    const { scrollRef, contentRef, hasContentAbove, hasContentBelow, onScroll } = useScrollFade();

    return (
        <div className="relative min-h-0 flex-1">
            <div ref={scrollRef} onScroll={onScroll} className={cn("h-full overflow-auto", className)}>
                <div ref={contentRef}>{children}</div>
            </div>
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-card to-transparent transition-opacity",
                    hasContentAbove ? "opacity-100" : "opacity-0",
                )}
            />
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent transition-opacity",
                    hasContentBelow ? "opacity-100" : "opacity-0",
                )}
            />
        </div>
    );
}
