import { cn } from "@/lib/utils";

interface HeaderAccentRuleProps {
    accent:      string;
    withRxGlyph?: boolean;
    className?:   string;
}

// The divider between the letterhead and the Rx body. A solid bar (not a gradient) so it
// stays crisp on both color and black-and-white printers.
export default function HeaderAccentRule({ accent, withRxGlyph, className }: HeaderAccentRuleProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: accent }} />
            {withRxGlyph && (
                <span className="font-display text-lg leading-none" style={{ color: accent }}>℞</span>
            )}
        </div>
    );
}
