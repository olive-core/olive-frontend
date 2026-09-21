import { SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ChamberOption } from "@/types/insights";
import { countRefinements, type InsightFilters } from "./insight-filters";

const SEXES = [
    { key: undefined, label: "Anyone" },
    { key: "male",    label: "Male" },
    { key: "female",  label: "Female" },
];

function boundedAge(raw: string): number | undefined {
    const age = Number(raw);
    return raw === "" || Number.isNaN(age) ? undefined : Math.min(Math.max(age, 0), 120);
}

interface RefinePanelProps {
    filters:  InsightFilters;
    chambers: ChamberOption[];
    onChange: (patch: Partial<InsightFilters>) => void;
}

/** Age, sex and chamber. Real but rarely-used narrowings, kept off the bar so the
 *  bar stays readable at a glance. */
export default function RefinePanel({ filters, chambers, onChange }: RefinePanelProps) {
    const active = countRefinements(filters);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "h-11 shrink-0 gap-2 rounded-xl border-slate-200 font-normal",
                        active ? "text-emerald-700 ring-1 ring-emerald-200" : "text-slate-600",
                    )}
                >
                    <SlidersHorizontalIcon className="size-4" />
                    Refine
                    {active > 0 && (
                        <span className="rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">{active}</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto space-y-5 rounded-xl">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Age</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number" inputMode="numeric" min={0} max={120} placeholder="From"
                            value={filters.ageMin ?? ""}
                            onChange={(event) => onChange({ ageMin: boundedAge(event.target.value) })}
                        />
                        <span className="text-slate-400">to</span>
                        <Input
                            type="number" inputMode="numeric" min={0} max={120} placeholder="To"
                            value={filters.ageMax ?? ""}
                            onChange={(event) => onChange({ ageMax: boundedAge(event.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Sex</Label>
                    <div className="flex gap-2">
                        {SEXES.map((sex) => (
                            <button
                                key={sex.label}
                                type="button"
                                onClick={() => onChange({ sex: sex.key })}
                                className={cn(
                                    "min-h-11 flex-1 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                    filters.sex === sex.key
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                                )}
                            >
                                {sex.label}
                            </button>
                        ))}
                    </div>
                </div>

                {chambers.length > 1 && (
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-500">Chamber</Label>
                        <div className="space-y-1">
                            {[{ chamber_id: "", label: "All chambers" }, ...chambers].map((chamber) => (
                                <button
                                    key={chamber.chamber_id}
                                    type="button"
                                    onClick={() => onChange({ chamberId: chamber.chamber_id || undefined })}
                                    className={cn(
                                        "min-h-11 w-full break-words rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                                        (filters.chamberId ?? "") === chamber.chamber_id
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "text-slate-600 hover:bg-slate-50",
                                    )}
                                >
                                    {chamber.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
