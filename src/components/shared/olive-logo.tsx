import { cn } from "@/lib/utils";

// The primary logo (leaf on the i). Keep it at least 100px wide: below that the leaf
// stops reading as a leaf, and the guidelines switch to the symbol on its own.
export default function OliveLogo({ width = 104, className }: { width?: number; className?: string }) {
    return (
        <img
            src="/logo/olive-logo.svg"
            alt="Olive"
            width={width}
            height={Math.round(width * 0.415)}
            style={{ width }}
            className={cn("h-auto shrink-0", className)}
        />
    );
}
