import type { DateRange } from "./date-range";
import DateRangePicker from "./date-range-picker";
import PatientSearch from "./patient-search";

interface ConsultationsToolbarProps {
    dateRange:       DateRange;
    onDateChange:    (range: DateRange) => void;
    searchTerm:      string;
    onSearchChange:  (term: string) => void;
}

export default function ConsultationsToolbar({
    dateRange,
    onDateChange,
    searchTerm,
    onSearchChange,
}: ConsultationsToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <PatientSearch  value={searchTerm} onChange={onSearchChange} />
            <DateRangePicker value={dateRange} onChange={onDateChange} />
        </div>
    );
}
