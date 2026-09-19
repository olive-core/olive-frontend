import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientRowProps {
    prescriptionId: string;
    name?:   string | null;
    detail?: string;
    /** The number that made this patient worth listing. */
    trailing: string;
    tone?:   "plain" | "warning";
}

/** A named patient is always worth opening, so every list of them links to that
 *  consultation rather than sitting as dead text. Two lines at every width: letting
 *  the row wrap only when it is long makes one row in four break differently. */
export default function PatientRow({ prescriptionId, name, detail, trailing, tone = "plain" }: PatientRowProps) {
    return (
        <Link
            to="/doctor/consultations/$prescriptionId"
            params={{ prescriptionId }}
            search={{ document: undefined }}
            className={cn(
                "group block rounded-lg px-2 py-2.5 transition-colors",
                tone === "warning" ? "hover:bg-orange-100/60" : "hover:bg-slate-50",
            )}
        >
            <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">{name ?? "Unknown patient"}</span>
                <ChevronRightIcon className="size-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600" />
            </span>
            <span className="mt-0.5 flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate text-slate-500">{detail}</span>
                <span className={cn("shrink-0", tone === "warning" ? "text-orange-700" : "text-slate-500")}>
                    {trailing}
                </span>
            </span>
        </Link>
    );
}
