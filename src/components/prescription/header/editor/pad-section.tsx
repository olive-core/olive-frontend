import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { PadSectionId } from "@/stores/header-config-store";

// One row of the editor's section list. Collapsed it reads as a plain sentence — what the
// section is and what it currently says — so a doctor can find what they want by reading
// down the page instead of guessing behind a tab label.

interface PadSectionProps {
    id:              PadSectionId;
    icon:            LucideIcon;
    title:           string;
    summary:         string;
    needsAttention?: boolean;
    badge?:          ReactNode;
    children:        ReactNode;
}

export default function PadSection({ id, icon: Icon, title, summary, needsAttention, badge, children }: PadSectionProps) {
    return (
        <AccordionItem value={id} className="rounded-xl border bg-white px-3 shadow-xs last:border-b sm:px-4">
            <AccordionTrigger className="min-h-14 min-w-0 items-center gap-3 py-3 hover:no-underline">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                        className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            needsAttention ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
                        )}
                    >
                        <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5 text-left">
                        <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold break-words text-slate-800">
                            {title}
                            {badge}
                        </span>
                        <span className={cn("truncate text-xs", needsAttention ? "text-amber-600" : "text-slate-400")}>
                            {needsAttention ? "Not filled in yet" : summary}
                        </span>
                    </span>
                </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 pb-4">{children}</AccordionContent>
        </AccordionItem>
    );
}
