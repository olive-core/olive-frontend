import { addDays, format } from "date-fns";

import type { FollowUpType } from "@/types/prescription";
import { formatFollowUpInterval } from "@/lib/vitals";
import { cn } from "@/lib/utils";

interface FollowUpBlockProps {
    value: FollowUpType;
    onChange?: (data: Partial<FollowUpType>) => void;
    baseDate?: string | Date;
}

const PRESETS: { label: string; days: number }[] = [
    { label: "1 wk", days: 7 },
    { label: "2 wk", days: 14 },
    { label: "1 mo", days: 30 },
    { label: "3 mo", days: 90 },
    { label: "6 mo", days: 180 },
];

const PRESET_DAYS = PRESETS.map((preset) => preset.days);

function parseDays(value: string): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) || parsed <= 0 ? null : Math.round(parsed);
}

function EditableFollowUp({ value, onChange }: Required<Omit<FollowUpBlockProps, "baseDate">>) {
    const { follow_up_days, follow_up_notes } = value;
    const customDays = follow_up_days != null && !PRESET_DAYS.includes(follow_up_days) ? String(follow_up_days) : "";

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
                {PRESETS.map((preset) => {
                    const isActive = follow_up_days === preset.days;
                    return (
                        <button
                            key={preset.days}
                            type="button"
                            onClick={() => onChange({ follow_up_days: isActive ? null : preset.days })}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                                isActive
                                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                            )}
                        >
                            {preset.label}
                        </button>
                    );
                })}

                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>or</span>
                    <input
                        type="number"
                        inputMode="numeric"
                        placeholder="—"
                        value={customDays}
                        onChange={(e) => onChange({ follow_up_days: parseDays(e.target.value) })}
                        className="h-7 w-12 rounded-md border border-slate-200 bg-white px-1 text-center text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
                    />
                    <span>days</span>
                </div>
            </div>

            <input
                type="text"
                placeholder="Add a follow-up note (optional)"
                value={follow_up_notes ?? ""}
                onChange={(e) => onChange({ follow_up_notes: e.target.value })}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400"
            />
        </div>
    );
}

function ReadOnlyFollowUp({ value, baseDate }: Omit<FollowUpBlockProps, "onChange">) {
    const interval = formatFollowUpInterval(value.follow_up_days);
    const dueDate =
        value.follow_up_days && baseDate
            ? format(addDays(new Date(baseDate), value.follow_up_days), "MMM dd, yyyy")
            : null;

    return (
        <div className="flex flex-col gap-0.5">
            {interval && (
                <p className="text-sm text-slate-700">
                    After <span className="font-semibold">{interval}</span>
                    {dueDate && <span className="text-slate-400"> · {dueDate}</span>}
                </p>
            )}
            {value.follow_up_notes && <p className="text-xs italic text-slate-500">{value.follow_up_notes}</p>}
        </div>
    );
}

export default function FollowUpBlock({ value, onChange, baseDate }: FollowUpBlockProps) {
    const isEditable = onChange !== undefined;
    const hasContent = value.follow_up_days != null || Boolean(value.follow_up_notes);

    if (!isEditable && !hasContent) return null;

    return (
        <div className="flex flex-col gap-2 rounded-xl border bg-white p-3">
            <h3 className="text-sm font-semibold text-slate-700">Follow Up</h3>
            {isEditable ? <EditableFollowUp value={value} onChange={onChange} /> : <ReadOnlyFollowUp value={value} baseDate={baseDate} />}
        </div>
    );
}
