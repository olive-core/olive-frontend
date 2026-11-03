import { cn } from "@/lib/utils";
import type { Period } from "./filter-prescriptions";

const PERIODS: { value: Period; label: string }[] = [
    { value: 'all', label: 'All time'  },
    { value: '3m',  label: '3 months' },
    { value: '6m',  label: '6 months' },
    { value: '1y',  label: '1 year'   },
];

interface PeriodFilterProps {
    value:    Period;
    onChange: (period: Period) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {PERIODS.map((period) => (
                <button
                    key={period.value}
                    type="button"
                    onClick={() => onChange(period.value)}
                    className={cn(
                        "inline-flex items-center justify-center min-h-11 px-4 rounded-full text-sm font-medium border transition-colors",
                        value === period.value
                            ? "bg-brand-100 text-brand-700 border-brand-300"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                    )}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );
}
