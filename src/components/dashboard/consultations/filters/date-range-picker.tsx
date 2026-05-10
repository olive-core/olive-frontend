import { useState } from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    EMPTY_DATE_RANGE,
    formatDateRangeLabel,
    isDateRangeActive,
    type DateRange,
} from "./date-range";

interface DateRangePickerProps {
    value:    DateRange;
    onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {

    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRange>(value);

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (next) setDraft(value);
    };

    const handleApply = () => {
        onChange(draft);
        setOpen(false);
    };

    const handleClear = () => {
        setDraft(EMPTY_DATE_RANGE);
        onChange(EMPTY_DATE_RANGE);
        setOpen(false);
    };

    const isActive = isDateRangeActive(value);

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-9 gap-2 font-normal",
                        isActive ? "border-emerald-300 text-emerald-700" : "text-slate-600",
                    )}
                >
                    <CalendarIcon className="size-4" />
                    {formatDateRangeLabel(value)}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="filter-from-date" className="text-xs text-slate-500">From</Label>
                    <Input
                        id="filter-from-date"
                        type="date"
                        value={draft.fromDate ?? ""}
                        max={draft.toDate}
                        onChange={(event) => setDraft({ ...draft, fromDate: event.target.value || undefined })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="filter-to-date" className="text-xs text-slate-500">To</Label>
                    <Input
                        id="filter-to-date"
                        type="date"
                        value={draft.toDate ?? ""}
                        min={draft.fromDate}
                        onChange={(event) => setDraft({ ...draft, toDate: event.target.value || undefined })}
                    />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={!isDateRangeActive(draft) && !isActive}
                        className="text-slate-500"
                    >
                        <XIcon className="size-3.5 mr-1" />
                        Clear
                    </Button>
                    <Button size="sm" onClick={handleApply}>
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
