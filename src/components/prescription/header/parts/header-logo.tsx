import { cn } from "@/lib/utils";

interface HeaderLogoProps {
    url:       string;
    isMono:    boolean;
    className?: string;
}

// The center/hospital logo. Grayscaled in monochrome mode so it prints cleanly on a
// black-and-white printer without a muddy color block.
export default function HeaderLogo({ url, isMono, className }: HeaderLogoProps) {
    return (
        <img
            src={url}
            alt="Center logo"
            className={cn("h-16 w-auto max-w-[140px] shrink-0 object-contain", isMono && "grayscale", className)}
        />
    );
}
