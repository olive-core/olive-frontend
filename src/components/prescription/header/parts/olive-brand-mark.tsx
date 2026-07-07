import { cn } from "@/lib/utils";

interface OliveBrandMarkProps {
    isMono:    boolean;
    size?:     number;
    className?: string;
}

// "Powered by Olive" using the real Olive monogram, shown on prescriptions only (the site
// header keeps its own logo). `size` is the monogram height; the tag sits beside it so the
// lockup stays one shallow row. Grayscaled in monochrome mode to stay B/W-printer safe.
export default function OliveBrandMark({ isMono, size = 32, className }: OliveBrandMarkProps) {
    return (
        <div data-focus="oliveBrand" className={cn("flex items-center gap-1.5", className)}>
            <span className="text-[9px] leading-none text-slate-400">Powered by</span>
            <img
                src="/logo/olive-logo-test.png"
                alt="Olive"
                style={{ height: size }}
                className={cn("w-auto object-contain", isMono && "grayscale")}
            />
        </div>
    );
}
