import { cn } from "@/lib/utils";

interface MedicalSymbolProps {
    width:     number;
    height:    number;
    className?: string;
}

// The physician's caduceus mark. A black PNG, so it prints faithfully on both color and
// black-and-white printers. Width and height are set independently (the image stretches
// to fill), and `data-focus` makes it click-to-edit in the editor preview.
export default function MedicalSymbol({ width, height, className }: MedicalSymbolProps) {
    return (
        <img
            src="/logo/med-logo.png"
            alt="Medical symbol"
            data-focus="medicalSymbol"
            style={{ width, height }}
            className={cn("shrink-0", className)}
        />
    );
}
