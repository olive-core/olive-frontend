import { format } from "date-fns";

export type DateRange = {
    fromDate?: string;
    toDate?:   string;
}

export const EMPTY_DATE_RANGE: DateRange = { fromDate: undefined, toDate: undefined };

export function isDateRangeActive(range: DateRange): boolean {
    return Boolean(range.fromDate || range.toDate);
}

export function formatDateRangeLabel(range: DateRange): string {
    const { fromDate, toDate } = range;
    if (!fromDate && !toDate) return "Any date";
    if (fromDate && toDate)   return `${formatShort(fromDate)} – ${formatShort(toDate)}`;
    if (fromDate)             return `From ${formatShort(fromDate)}`;
    return `Until ${formatShort(toDate!)}`;
}

function formatShort(isoDate: string): string {
    return format(new Date(isoDate), "MMM d, yyyy");
}
