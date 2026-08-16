import { AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MedicineCardProps {
    typeLabel?:     string | null;
    tradeName?:     string | null;
    genericName?:   string | null;
    fallbackName?:  string | null;
    dosage?:        string | null;
    frequencyText?: string | null;
    durationText?:  string | null;
    notes?:         string | null;
    reasoning?:     string | null;
    // Width is capped for the paper view; the editor list overrides it to fill its column.
    className?:     string;
}

function MedicineName({ typeLabel, tradeName, genericName, fallbackName }: Pick<MedicineCardProps, "typeLabel" | "tradeName" | "genericName" | "fallbackName">) {
    // basis-48: the name never drops below a readable column — below that the frequency
    // wraps away and gives it the whole card.
    return (
        <div className="flex min-w-0 flex-1 basis-48 flex-col">
            {typeLabel && <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">{typeLabel}</span>}
            <h3 className="text-slate-900 leading-tight break-words">
                {tradeName ? (
                    <span className="font-bold text-base">{tradeName}</span>
                ) : (
                    <span className="font-semibold text-base">{fallbackName}</span>
                )}
            </h3>
            {genericName && <div className="text-xs text-slate-900 mt-0.5">{genericName}</div>}
        </div>
    );
}

export default function MedicineCard({ typeLabel, tradeName, genericName, fallbackName, dosage, frequencyText, durationText, notes, reasoning, className }: MedicineCardProps) {
    const detail = [dosage, durationText].filter(Boolean).join(" · ");

    return (
        <div className={cn("group relative rounded-lg border p-3 bg-muted border-border w-full max-w-lg transition-colors hover:bg-emerald-50/50 hover:border-emerald-200", className)}>
            {/* The frequency keeps its place on the right while both fit. A long one — "1+0+1
                (after meal)" on a phone column — takes its own line underneath instead of
                squeezing the medicine name into a two-character-wide ribbon. */}
            <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5">
                <MedicineName typeLabel={typeLabel} tradeName={tradeName} genericName={genericName} fallbackName={fallbackName} />
                {frequencyText && (
                    <span className="ml-auto shrink-0 text-right text-sm font-semibold text-slate-800">{frequencyText}</span>
                )}
            </div>

            {detail && <div className="text-sm text-slate-900 mt-1">{detail}</div>}

            {reasoning && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-800 italic leading-tight">{reasoning}</p>
                </div>
            )}

            {notes && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50/50 border border-amber-200 flex items-start gap-1.5">
                    <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 leading-tight">{notes}</p>
                </div>
            )}
        </div>
    );
}
