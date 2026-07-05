import type { ReactNode } from "react";
import { Building2, Clock, Hash, MapPin, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HeaderConfig } from "@/lib/header-config";

interface ChamberContactBlockProps {
    config:  HeaderConfig;
    align?:  "left" | "right" | "center";
    layout?: "stacked" | "inline";
    className?: string;
}

interface ContactLine {
    key:  string;
    icon: ReactNode;
    text: string;
}

const ICON_CLASS = "size-3.5 shrink-0 text-slate-400";

function customFieldText(label: string, value: string): string {
    if (label && value) return `${label}: ${value}`;
    return value || label;
}

// The chamber name is emphasised on its own; everything else becomes an icon + text line.
function buildContactLines(config: HeaderConfig): ContactLine[] {
    const lines: ContactLine[] = [];

    if (config.chamberAddress.trim()) {
        lines.push({ key: "address", icon: <MapPin className={ICON_CLASS} />, text: config.chamberAddress });
    }
    config.phones.filter(phone => phone.trim()).forEach((phone, index) => {
        lines.push({ key: `phone-${index}`, icon: <Phone className={ICON_CLASS} />, text: phone });
    });
    if (config.visitingHours.trim()) {
        lines.push({ key: "hours", icon: <Clock className={ICON_CLASS} />, text: config.visitingHours });
    }
    if (config.serial.trim()) {
        lines.push({ key: "serial", icon: <Hash className={ICON_CLASS} />, text: config.serial });
    }
    config.customFields.forEach(field => {
        const text = customFieldText(field.label.trim(), field.value.trim());
        if (text) {
            lines.push({ key: field.id, icon: <span className="size-1.5 shrink-0 rounded-full bg-slate-300" />, text });
        }
    });

    return lines;
}

export default function ChamberContactBlock({ config, align = "left", layout = "stacked", className }: ChamberContactBlockProps) {
    const lines = buildContactLines(config);
    if (!config.chamberName.trim() && lines.length === 0) return null;

    if (layout === "inline") {
        return (
            <div
                className={cn(
                    "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600",
                    align === "center" && "justify-center text-center",
                    align === "right" && "justify-end",
                    className,
                )}
            >
                {config.chamberName.trim() && (
                    <span className="font-semibold text-slate-800">{config.chamberName}</span>
                )}
                {lines.map(line => (
                    <span key={line.key} className="flex items-center gap-1.5">
                        {line.icon}
                        <span>{line.text}</span>
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-0.5",
                align === "right" && "items-start md:items-end md:text-right",
                align === "center" && "items-center text-center",
                className,
            )}
        >
            {config.chamberName.trim() && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Building2 className={ICON_CLASS} />
                    {config.chamberName}
                </p>
            )}
            {lines.map(line => (
                <p key={line.key} className="flex items-center gap-1.5 text-sm text-slate-600">
                    {line.icon}
                    <span>{line.text}</span>
                </p>
            ))}
        </div>
    );
}
