import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";


export default function ConsultationLinkMark({ className }: { className?: string }) {
    return (
        <span className={cn("inline-flex items-center gap-1", className)} aria-hidden>
            <span className="size-3 rounded-full border-[3px] border-current" />
            <ArrowRightIcon className="size-4" strokeWidth={2.5} />
            <span className="size-3 rounded-full bg-current" />
        </span>
    );
}
