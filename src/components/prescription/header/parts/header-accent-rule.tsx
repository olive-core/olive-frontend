import { cn } from "@/lib/utils";

type RuleVariant = "solid" | "double" | "hairline";

interface HeaderAccentRuleProps {
    accent:    string;
    variant?:  RuleVariant;
    className?: string;
}

// The divider between the letterhead and the Rx body. Solid bars only (no gradients) so it
// stays crisp on both color and black-and-white printers. "double" is the thick-thin pair
// of classic engraved stationery; "hairline" is a quiet neutral line.
export default function HeaderAccentRule({ accent, variant = "solid", className }: HeaderAccentRuleProps) {
    if (variant === "double") {
        return (
            <div className={className}>
                <div className="h-[2.5px] w-full rounded-full" style={{ backgroundColor: accent }} />
                <div className="mt-[3px] h-px w-full bg-slate-300" />
            </div>
        );
    }

    if (variant === "hairline") {
        return <div className={cn("h-px w-full bg-slate-200", className)} />;
    }

    return <div className={cn("h-[2px] w-full rounded-full", className)} style={{ backgroundColor: accent }} />;
}
