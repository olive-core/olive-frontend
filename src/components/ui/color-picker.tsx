import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
    value:     string;
    onChange:  (color: string) => void;
    swatches?: string[];
    className?: string;
}

// A compact color control: a swatch button that opens a popover with quick preset swatches,
// a native color input, and a hex field. Built on the shared Popover primitive.
export function ColorPicker({ value, onChange, swatches = [], className }: ColorPickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Pick accent color"
                    className={cn(
                        "flex h-11 items-center gap-2 rounded-md border border-input bg-transparent px-2 shadow-xs transition-colors hover:bg-slate-50 sm:h-9",
                        className,
                    )}
                >
                    <span className="size-5 rounded-full border border-black/10" style={{ backgroundColor: value }} />
                    <span className="font-mono text-xs uppercase text-slate-600">{value}</span>
                </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-56">
                <div className="flex flex-col gap-3">
                    {swatches.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {swatches.map(swatch => (
                                <button
                                    key={swatch}
                                    type="button"
                                    aria-label={`Use ${swatch}`}
                                    onClick={() => onChange(swatch)}
                                    className={cn(
                                        "size-9 rounded-full border transition-transform hover:scale-110 sm:size-7",
                                        swatch.toLowerCase() === value.toLowerCase() ? "border-slate-900" : "border-black/10",
                                    )}
                                    style={{ backgroundColor: swatch }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            aria-label="Custom color"
                            className="h-11 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1 sm:h-9 sm:w-10"
                        />
                        <Input
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            className="h-11 font-mono text-xs uppercase sm:h-9"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
