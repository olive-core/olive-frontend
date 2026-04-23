import { AlertCircle, Clock, Sparkles, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import type { MeedicineType } from '@/types/prescription';

interface MedicineViewProps {
    medicine: MeedicineType,
    onRemove: (index: number) => void,
    index: number,
    setIsEditing: (isEditing: boolean, index: number) => void,
}

// Helper: Generates the "1+0+1" string
const getFrequencyPattern = (r: MeedicineType['routine']) => {
    const morning = r.beforeBreakfast || r.afterBreakfast ? '1' : '0';
    const noon = r.beforeLunch || r.afterLunch ? '1' : '0';
    const night = r.beforeDinner || r.afterDinner ? '1' : '0';
    const pattern = `${morning} + ${noon} + ${night}`;

    if (pattern === '0 + 0 + 0' && r.gapHours) {
        return null; // Gap hours override the pattern only if no meals selected
    }

    return pattern;
};

// Helper: Generates the "After Meal" / "Before Meal" text
const getTimingLabel = (r: MeedicineType['routine']) => {
    if (r.gapHours) return `Every ${r.gapHours}h`;

    const isBefore = r.beforeBreakfast || r.beforeLunch || r.beforeDinner;
    const isAfter = r.afterBreakfast || r.afterLunch || r.afterDinner;

    if (isBefore && isAfter) return 'See Notes'; // Mixed routine
    if (isBefore) return 'Before Meal';
    if (isAfter) return 'After Meal';
    return '';
};

const MedicineView = ({ medicine, onRemove, index, setIsEditing }: MedicineViewProps) => {
    const pattern = getFrequencyPattern(medicine.routine);
    const timingLabel = getTimingLabel(medicine.routine);



    return (
        <div
            className="group relative transition-all duration-200 rounded-lg border p-3 cursor-pointer bg-muted hover:bg-accent border-border w-full max-w-lg"
            onClick={() => setIsEditing(true, index)}
        >

            {/* Top Row: Name and Pattern */}
            <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col">
                    <h3 className="text-slate-900 leading-tight">
                        {medicine.trade_name ? (
                            <span className="font-bold text-base">{medicine.trade_name}</span>
                        ) : (
                            <span className="font-semibold text-base">{medicine.name}</span>
                        )}
                    </h3>
                    {medicine.generic_name && (
                        <div className="text-xs text-slate-500 mt-0.5">{medicine.generic_name}</div>
                    )}
                </div>

                {/* The 1+0+1 Pattern */}
                {pattern ? (
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-slate-800 tracking-wider">
                            {pattern}
                        </span>
                    </div>
                ) : (
                    /* Fallback for Gap Hours */
                    <div className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                        <Clock size={14} />
                        <span>Every {medicine.routine.gapHours}h</span>
                    </div>
                )}
            </div>

            {/* Bottom Row: Dosage/Value and Timing Instruction */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">
                    {medicine.dosage}
                </div>

                {/* Timing Chip (Before/After) */}
                {timingLabel && !medicine.routine.gapHours && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${timingLabel === 'Before Meal'
                        ? 'bg-slate-100 text-slate-700 border-slate-200' // Neutral/Grey for Before
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100' // Green tint for After
                        }`}>
                        {timingLabel}
                    </span>
                )}
            </div>

            {/* Reasoning / Purpose */}
            {medicine.reasoning && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-1.5 transition-colors group-hover:bg-emerald-100/30">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600 italic leading-tight">
                        {medicine.reasoning}
                    </p>
                </div>
            )}

            {/* Optional: Compact Notes Footer */}
            <div className="flex items-center mt-2">
                {medicine.notes && (
                    <div className="p-2 rounded-lg bg-amber-50/50 group-hover:bg-amber-100/40 flex items-start gap-1.5 transition-colors group-hover:border-amber-400 border border-amber-200 flex-1">
                        <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 leading-tight">{medicine.notes}</p>
                    </div>
                )}

                <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-50 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default MedicineView;