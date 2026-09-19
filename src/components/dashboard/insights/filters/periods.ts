import { format, subDays, subMonths } from "date-fns";

export type PeriodKey = "30d" | "3m" | "12m" | "all";

// `tight` is what fits four tabs across a 320px phone; `short` is the tab itself;
// `label` is how the period is named in prose.
export const PERIODS: { key: PeriodKey; label: string; short: string; tight: string }[] = [
    { key: "30d", label: "Last 30 days",   short: "30 days",   tight: "30d" },
    { key: "3m",  label: "Last 3 months",  short: "3 months",  tight: "3m" },
    { key: "12m", label: "Last 12 months", short: "12 months", tight: "12m" },
    { key: "all", label: "All time",       short: "All time",  tight: "All" },
];

export const DEFAULT_PERIOD: PeriodKey = "12m";

/** The start date a period means today, or undefined for all time. */
export function periodStart(period: PeriodKey, today = new Date()): string | undefined {
    switch (period) {
        case "30d": return format(subDays(today, 30), "yyyy-MM-dd");
        case "3m":  return format(subMonths(today, 3), "yyyy-MM-dd");
        case "12m": return format(subMonths(today, 12), "yyyy-MM-dd");
        default:    return undefined;
    }
}

export function periodLabel(period: PeriodKey): string {
    return PERIODS.find((entry) => entry.key === period)?.label ?? "";
}
