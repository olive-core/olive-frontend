import type { LabelCount } from "@/types/insights";

const CHART_HEIGHT = "h-28 sm:h-36";

/** Age reads as a distribution, so it gets columns rather than another row of bars —
 *  the one place on the page where the shape itself is the message. Each count sits on
 *  its own column, so the numbers trace the silhouette instead of floating on one rule. */
export default function AgeColumns({ bands }: { bands: LabelCount[] }) {
    const tallest = Math.max(...bands.map((band) => band.count), 1);

    return (
        <ul className="flex max-w-lg items-end gap-1.5 sm:gap-3">
            {bands.map((band) => (
                <li key={band.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                    <span className={`flex w-full flex-col justify-end ${CHART_HEIGHT}`}>
                        <span className="text-center text-xs font-semibold tabular-nums text-slate-900">{band.count}</span>
                        <span
                            className="mt-1 w-full rounded-t-md bg-emerald-500 transition-[height] duration-500 ease-out"
                            style={{ height: `${Math.max((band.count / tallest) * 82, band.count > 0 ? 3 : 1)}%` }}
                        />
                    </span>
                    <span className="w-full truncate text-center text-[11px] text-slate-500">{band.label}</span>
                </li>
            ))}
        </ul>
    );
}
