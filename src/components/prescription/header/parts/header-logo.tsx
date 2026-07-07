import { cn } from "@/lib/utils";
import type { LogoShape } from "@/lib/header-config";

interface HeaderLogoProps {
    url:       string;
    isMono:    boolean;
    shape:     LogoShape;
    size:      number;
    className?: string;
}

const SHAPE_CLASS: Record<LogoShape, string> = {
    circle:  "rounded-full",
    rounded: "rounded-lg",
    square:  "rounded-none",
};

// The center/hospital logo inside a fixed square frame: constant size and shape no matter
// the uploaded image's aspect ratio, so the letterhead never shifts around the logo.
// Grayscaled in monochrome mode so it prints cleanly on a black-and-white printer.
// `data-focus` makes it click-to-edit in the editor preview.
export default function HeaderLogo({ url, isMono, shape, size, className }: HeaderLogoProps) {
    return (
        <span
            data-focus="logo"
            style={{ width: size, height: size }}
            className={cn(
                "flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-white p-1",
                SHAPE_CLASS[shape],
                className,
            )}
        >
            <img src={url} alt="Center logo" className={cn("h-full w-full object-contain", isMono && "grayscale")} />
        </span>
    );
}
