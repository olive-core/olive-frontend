import type { DateRange } from "./date-range";
import DateRangePicker from "./date-range-picker";
import ConsultationSearch from "./consultation-search";
import { Button } from "@/components/ui/button";

export type CaseAccessFilter = "all" | "owned" | "shared";

interface ConsultationsToolbarProps {
    dateRange:       DateRange;
    onDateChange:    (range: DateRange) => void;
    searchTerm:      string;
    onSearchChange:  (term: string) => void;
    accessFilter:    CaseAccessFilter;
    onAccessChange:  (value: CaseAccessFilter) => void;
}

export default function ConsultationsToolbar({
    dateRange,
    onDateChange,
    searchTerm,
    onSearchChange,
    accessFilter,
    onAccessChange,
}: ConsultationsToolbarProps) {
    return (
        <div className="mb-6 flex flex-col gap-3">
            <ConsultationSearch value={searchTerm} onChange={onSearchChange} />
            <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2" aria-label="Consultation ownership">
                {(["all", "owned", "shared"] as const).map((value) => (
                    <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={accessFilter === value ? "default" : "outline"}
                        onClick={() => onAccessChange(value)}
                        aria-pressed={accessFilter === value}
                        className={`min-h-11 px-4 ${accessFilter === value ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    >
                        {value === "all" ? "All" : value === "owned" ? "Mine" : "Shared"}
                    </Button>
                ))}
            </div>
            <DateRangePicker value={dateRange} onChange={onDateChange} />
            </div>
        </div>
    );
}
