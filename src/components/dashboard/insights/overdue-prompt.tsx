import { ChevronRightIcon, PhoneIcon } from "lucide-react";
import { plural } from "./format";
import type { InsightFilters } from "./filters/insight-filters";
import { useFollowUp } from "./use-insights";

/** The only thing on this page anyone can act on today, so it does not sit three taps
 *  deep. Shows only when there is somebody to call. */
export default function OverduePrompt({ filters, onOpen }: { filters: InsightFilters; onOpen: () => void }) {
    const { data } = useFollowUp(filters);
    const overdue = data?.overdue_count ?? 0;
    if (overdue === 0) return null;

    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center gap-2.5 rounded-xl bg-orange-50 px-4 py-3 text-left ring-1 ring-orange-100 transition-colors hover:bg-orange-100/70"
        >
            <PhoneIcon className="size-4 shrink-0 text-orange-600" />
            <span className="text-sm text-orange-900">
                <span className="font-semibold">{overdue}</span>{" "}
                {plural(overdue, "patient is", "patients are")} overdue for follow-up
            </span>
            <ChevronRightIcon className="ml-auto size-4 shrink-0 text-orange-400" />
        </button>
    );
}
