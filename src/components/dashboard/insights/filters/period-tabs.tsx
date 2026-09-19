import { cn } from "@/lib/utils";
import { PERIODS, type PeriodKey } from "./periods";

interface PeriodTabsProps {
    value:    PeriodKey;
    onChange: (period: PeriodKey) => void;
}

export default function PeriodTabs({ value, onChange }: PeriodTabsProps) {
    return (
        <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Period">
            {PERIODS.map((period) => (
                <button
                    key={period.key}
                    type="button"
                    onClick={() => onChange(period.key)}
                    aria-pressed={value === period.key}
                    className={cn(
                        "flex-1 whitespace-nowrap rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:px-3",
                        value === period.key
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700",
                    )}
                >
                    <span className="sm:hidden">{period.tight}</span>
                    <span className="hidden sm:inline">{period.short}</span>
                </button>
            ))}
        </div>
    );
}
