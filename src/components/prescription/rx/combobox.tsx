import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command";

export interface ComboboxOption {
    value: string;
    label: string;
    hint?: string;
}

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    // Lets the doctor commit a typed value that isn't in the list (e.g. an unusual unit or site).
    allowCustom?: boolean;
}

// A searchable single-select: the trigger shows the current selection; opening reveals the full
// list (current value check-marked) with type-to-filter. `allowCustom` offers the typed text too.
export default function Combobox({
    value,
    onChange,
    options,
    placeholder = "Select...",
    searchPlaceholder = "Type to search...",
    allowCustom = false,
}: ComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = options.find(option => option.value === value);
    const triggerLabel = selected?.label ?? (value || placeholder);

    const commit = (next: string) => {
        onChange(next);
        setQuery("");
        setOpen(false);
    };

    const trimmedQuery = query.trim();
    const queryMatchesOption = options.some(
        option => option.label.toLowerCase() === trimmedQuery.toLowerCase() || option.value.toLowerCase() === trimmedQuery.toLowerCase(),
    );
    const showCustom = allowCustom && trimmedQuery.length > 0 && !queryMatchesOption;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex h-11 sm:h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-base sm:text-sm shadow-xs outline-none transition-colors hover:bg-slate-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        !selected && !value && "text-muted-foreground",
                    )}
                >
                    <span className="truncate text-left">{triggerLabel}</span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} />
                    {/* dvh, so an open keyboard shortens the list rather than hiding its tail. */}
                    <CommandList className="max-h-[min(18rem,45dvh)] overscroll-contain">
                        <CommandEmpty>No match.</CommandEmpty>
                        <CommandGroup>
                            {options.map(option => (
                                <CommandItem
                                    key={option.value}
                                    value={`${option.label} ${option.hint ?? ""} ${option.value}`}
                                    onSelect={() => commit(option.value)}
                                >
                                    <Check className={cn("size-4", option.value === value ? "text-emerald-600 opacity-100" : "opacity-0")} />
                                    <span className="font-medium">{option.label}</span>
                                    {option.hint && option.hint.toLowerCase() !== option.label.toLowerCase() && (
                                        <span className="text-muted-foreground text-xs">{option.hint}</span>
                                    )}
                                </CommandItem>
                            ))}
                            {showCustom && (
                                <CommandItem value={trimmedQuery} onSelect={() => commit(trimmedQuery)}>
                                    <Check className="size-4 opacity-0" />
                                    Use &ldquo;<span className="font-medium">{trimmedQuery}</span>&rdquo;
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
