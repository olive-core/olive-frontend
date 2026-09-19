import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { percent } from "./format";

export type BarRow = {
    key?:  string;
    label: string;
    count: number;
    /** Drawn in slate and set apart: a residual bucket is not one of the ranked items. */
    residual?: boolean;
}

interface BarListProps {
    rows:       BarRow[];
    /** Makes each row a button that narrows the whole page to it. */
    onPick?:    (key: string) => void;
    /** The denominator to draw against, when the card names one. Without it the bars
     *  scale to the largest row and read as a ranking, not as a share. */
    scaleTo?:   number;
    tone?:      "emerald" | "blue";
    emptyText?: string;
}

const TONES = {
    emerald: "bg-emerald-500",
    blue:    "bg-blue-600",
};

/** Name and count on one line, bar beneath. A medical name is too long to survive a
 *  label column on a phone, and this is the same shape as the complaint rows. */
export default function BarList({ rows, onPick, scaleTo, tone = "emerald", emptyText = "Nothing recorded yet" }: BarListProps) {
    if (rows.length === 0) return <p className="text-sm text-slate-500">{emptyText}</p>;

    const full = Math.max(scaleTo ?? 0, ...rows.map((row) => row.count), 1);

    return (
        <ul className="-mx-2 space-y-0.5">
            {rows.map((row) => {
                const canPick = Boolean(onPick && row.key);
                const body = (
                    <>
                        <span className="flex items-baseline justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-1 text-sm text-slate-700">
                                <span className="truncate">{row.label}</span>
                                {canPick && <ChevronRightIcon className="size-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600" />}
                            </span>
                            <span className="whitespace-nowrap text-sm tabular-nums text-slate-900">
                                <span className="font-semibold">{row.count}</span>
                                {scaleTo ? <span className="ml-1.5 text-xs text-slate-500">{percent(row.count / scaleTo)}</span> : null}
                            </span>
                        </span>
                        <span className="mt-1.5 block h-2 rounded-full bg-slate-100">
                            <span
                                className={cn(
                                    "block h-2 rounded-full transition-[width] duration-500 ease-out",
                                    row.residual ? "bg-slate-300" : TONES[tone],
                                )}
                                style={{ width: `${(row.count / full) * 100}%` }}
                            />
                        </span>
                    </>
                );

                return (
                    <li key={row.key ?? row.label}>
                        {canPick ? (
                            <button
                                type="button"
                                onClick={() => onPick!(row.key!)}
                                className="group block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                            >
                                {body}
                            </button>
                        ) : (
                            <div className="px-2 py-2">{body}</div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
