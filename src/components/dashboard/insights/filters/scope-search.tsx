import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { InsightFilterOptions, NamedCount } from "@/types/insights";
import type { SearchableField } from "./insight-filters";

const GROUPS: { field: SearchableField; heading: string; from: keyof InsightFilterOptions }[] = [
    { field: "complaint", heading: "Complaints",    from: "complaints" },
    { field: "diagnosis", heading: "Diagnoses",     from: "diagnoses" },
    { field: "medicine",  heading: "Medicines",     from: "medicines" },
];

const RESULTS_PER_GROUP = 6;

interface ScopeSearchProps {
    options?: InsightFilterOptions;
    onPick:   (field: SearchableField, key: string) => void;
}

/** One box for the three things a doctor looks people up by. Searching a complaint
 *  and searching a diagnosis are the same gesture, so they share a field. */
export default function ScopeSearch({ options, onPick }: ScopeSearchProps) {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState("");

    const matches = (rows: NamedCount[]) =>
        rows.filter((row) => row.label.toLowerCase().includes(typed.trim().toLowerCase()))
            .slice(0, RESULTS_PER_GROUP);

    const pick = (field: SearchableField, key: string) => {
        onPick(field, key);
        setTyped("");
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="h-11 w-full justify-start gap-3 rounded-xl border-slate-200 bg-white px-4 font-normal text-slate-500 hover:bg-white hover:text-slate-600"
                >
                    <SearchIcon className="size-4 shrink-0" />
                    <span className="truncate sm:hidden">Search a complaint or medicine</span>
                    <span className="hidden truncate sm:inline">Search a complaint, diagnosis or medicine</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[min(28rem,calc(100vw-2rem))] rounded-xl p-0"
            >
                <Command shouldFilter={false}>
                    <CommandInput value={typed} onValueChange={setTyped} placeholder="Type a name..." />
                    <CommandList>
                        <CommandEmpty>Nothing recorded by that name.</CommandEmpty>
                        {GROUPS.map(({ field, heading, from }) => {
                            const rows = matches((options?.[from] ?? []) as NamedCount[]);
                            if (rows.length === 0) return null;
                            return (
                                <CommandGroup key={field} heading={heading}>
                                    {rows.map((row) => (
                                        <CommandItem key={row.key} value={`${field}:${row.key}`} onSelect={() => pick(field, row.key)}>
                                            <span className="flex-1 truncate">{row.label}</span>
                                            <span className="ml-2 text-xs tabular-nums text-slate-500">{row.count}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            );
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
