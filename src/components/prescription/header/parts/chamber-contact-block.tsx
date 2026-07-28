import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { contactLineText, visibleContactLines, type HeaderConfig } from "@/lib/header-config";
import ContactLineIcon from "./contact-line-icon";

interface ChamberContactBlockProps {
    config:  HeaderConfig;
    align?:  "left" | "right";
    showChamberName?: boolean;
    className?: string;
}

const ICON_CLASS = "size-3 shrink-0 text-slate-700";

export default function ChamberContactBlock({ config, align = "left", showChamberName = true, className }: ChamberContactBlockProps) {
    const lines = visibleContactLines(config);
    const showName = showChamberName && Boolean(config.chamberName.trim());
    if (!showName && lines.length === 0) return null;

    const isRight = align === "right";

    return (
        <div
            className={cn(
                "flex flex-col gap-[3px] text-[12.5px] leading-snug text-slate-900",
                isRight && "items-end text-right",
                className,
            )}
        >
            {showName && (
                <span data-focus="chamberName" className={cn("flex items-center gap-1.5 text-[13px] font-semibold text-slate-900", isRight && "flex-row-reverse")}>
                    <Building2 className={ICON_CLASS} />
                    {config.chamberName}
                </span>
            )}
            {lines.map((line) => (
                <span key={line.id} data-focus={`contact-${line.id}`} className={cn("flex items-start gap-1.5", isRight && "flex-row-reverse")}>
                    <ContactLineIcon kind={line.kind} className={cn(ICON_CLASS, "mt-[3px]")} />
                    <span className="whitespace-pre-line">{contactLineText(line)}</span>
                </span>
            ))}
        </div>
    );
}
