import type { Period } from "./filter-prescriptions";
import PrescriptionSearch from "./prescription-search";
import PeriodFilter from "./period-filter";

interface PrescriptionsFiltersProps {
    searchTerm:     string;
    onSearchChange: (term: string) => void;
    period:         Period;
    onPeriodChange: (period: Period) => void;
}

export default function PrescriptionsFilters({
    searchTerm,
    onSearchChange,
    period,
    onPeriodChange,
}: PrescriptionsFiltersProps) {
    return (
        <div className="flex flex-col gap-3 mb-6">
            <PrescriptionSearch value={searchTerm} onChange={onSearchChange} />
            <PeriodFilter value={period} onChange={onPeriodChange} />
        </div>
    );
}
