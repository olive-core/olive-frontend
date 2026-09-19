import { cn } from "@/lib/utils";
import type { LabelCount } from "@/types/insights";

/** A sequential ramp, because age bands are ordered — darkest is youngest. */
const BAND_SHADES = ["bg-emerald-700", "bg-emerald-600", "bg-emerald-500", "bg-emerald-400", "bg-emerald-300"];

function bandShade(index: number): string {
    return BAND_SHADES[index % BAND_SHADES.length];
}

export function AgeBandLegend({ bands }: { bands: LabelCount[] }) {
    return (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {bands.map((band, index) => (
                <li key={band.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={cn("size-2.5 rounded-sm", bandShade(index))} />
                    {band.label}
                </li>
            ))}
        </ul>
    );
}

interface AgeBandBarProps {
    bands: LabelCount[];
    /** How much of the track this row fills, against the largest row (0-1). Without it
     *  every row would be full width and a rare complaint would look as common as a
     *  frequent one. */
    fill:  number;
}

export default function AgeBandBar({ bands, fill }: AgeBandBarProps) {
    const total = bands.reduce((sum, band) => sum + band.count, 0);

    return (
        <span className="block h-2.5 w-full rounded-full bg-slate-100">
            <span
                className="flex h-2.5 overflow-hidden rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(fill, 0.02) * 100}%` }}
            >
                {total === 0
                    ? <span className="w-full bg-slate-200" />
                    : bands.map((band, index) => (
                        <span
                            key={band.label}
                            className={cn("block", bandShade(index))}
                            style={{ width: `${(band.count / total) * 100}%` }}
                            title={`${band.label}: ${band.count}`}
                        />
                    ))}
            </span>
        </span>
    );
}
