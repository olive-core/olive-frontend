import { AlertCircle, Clock, Sparkles } from "lucide-react";

export interface MedicineRoutine {
    beforeBreakfast?: boolean;
    afterBreakfast?:  boolean;
    beforeLunch?:     boolean;
    afterLunch?:      boolean;
    beforeDinner?:    boolean;
    afterDinner?:     boolean;
    gapHours?:        number | null;
}

export interface MedicineCardProps {
    tradeName?:    string | null;
    genericName?:  string | null;
    fallbackName?: string | null;
    dosage?:       string | null;
    notes?:        string | null;
    reasoning?:    string | null;
    routine:       MedicineRoutine;
}

function getFrequencyPattern(routine: MedicineRoutine): string | null {
    const morning = routine.beforeBreakfast || routine.afterBreakfast ? "1" : "0";
    const noon    = routine.beforeLunch     || routine.afterLunch     ? "1" : "0";
    const night   = routine.beforeDinner    || routine.afterDinner    ? "1" : "0";

    const pattern = `${morning} + ${noon} + ${night}`;
    if (pattern === "0 + 0 + 0" && routine.gapHours) return null;
    return pattern;
}

function getTimingLabel(routine: MedicineRoutine): string {
    if (routine.gapHours) return `Every ${routine.gapHours}h`;

    const isBefore = routine.beforeBreakfast || routine.beforeLunch || routine.beforeDinner;
    const isAfter  = routine.afterBreakfast  || routine.afterLunch  || routine.afterDinner;

    if (isBefore && isAfter) return "See Notes";
    if (isBefore) return "Before Meal";
    if (isAfter)  return "After Meal";
    return "";
}

function getTimingLabelClass(label: string): string {
    return label === "Before Meal"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-emerald-50 text-emerald-600 border-emerald-100";
}

function MedicineName({ tradeName, genericName, fallbackName }: Pick<MedicineCardProps, "tradeName" | "genericName" | "fallbackName">) {
    return (
        <div className="flex flex-col">
            <h3 className="text-slate-900 leading-tight">
                {tradeName ? (
                    <span className="font-bold text-base">{tradeName}</span>
                ) : (
                    <span className="font-semibold text-base">{fallbackName}</span>
                )}
            </h3>
            {genericName && (
                <div className="text-xs text-slate-500 mt-0.5">{genericName}</div>
            )}
        </div>
    );
}

function FrequencyDisplay({ routine }: { routine: MedicineRoutine }) {
    const pattern = getFrequencyPattern(routine);

    if (pattern) {
        return (
            <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-slate-800 tracking-wider">{pattern}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
            <Clock size={14} />
            <span>Every {routine.gapHours}h</span>
        </div>
    );
}

export default function MedicineCard({ tradeName, genericName, fallbackName, dosage, notes, reasoning, routine }: MedicineCardProps) {
    const timingLabel = getTimingLabel(routine);

    return (
        <div className="group relative rounded-lg border p-3 bg-muted border-border w-full max-w-lg transition-colors hover:bg-emerald-50/50 hover:border-emerald-200">
            <div className="flex justify-between items-start mb-1">
                <MedicineName tradeName={tradeName} genericName={genericName} fallbackName={fallbackName} />
                <FrequencyDisplay routine={routine} />
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">{dosage}</div>

                {timingLabel && !routine.gapHours && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getTimingLabelClass(timingLabel)}`}>
                        {timingLabel}
                    </span>
                )}
            </div>

            {reasoning && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600 italic leading-tight">{reasoning}</p>
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
