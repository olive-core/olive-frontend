import { useState } from "react";
import { PinIcon } from "lucide-react";

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMemoryLibrary, type MemorySummary } from "@/hooks/use-memory-library";
import { memorySectionLabel, type MemorySectionKey } from "@/lib/memory";
import MemoryChips from "./memory-chips";

interface MemoryPickerProps {
    open:         boolean;
    onOpenChange: (open: boolean) => void;
    /** Narrows the library to memories carrying this one section, and fills only it. */
    section?:     MemorySectionKey;
    onSelect:     (memory: MemorySummary) => void;
}

export default function MemoryPicker({ open, onOpenChange, section, onSelect }: MemoryPickerProps) {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 200);
    const { data: memories = [], isLoading } = useMemoryLibrary(debouncedQuery, section, open);

    const title = section ? `Fill ${memorySectionLabel(section).toLowerCase()} from a memory` : "Apply a memory";

    const handleSelect = (memory: MemorySummary) => {
        onSelect(memory);
        onOpenChange(false);
        setQuery("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Search your saved memories by name or by what is inside them.</DialogDescription>
                </DialogHeader>

                {/* The database ranks and matches, so cmdk must not filter or reorder on top of it. */}
                <Command shouldFilter={false}>
                    <CommandInput value={query} onValueChange={setQuery} placeholder={`${title}...`} />
                    <CommandList className="max-h-80">
                        {!isLoading && (
                            <CommandEmpty>
                                {query ? "No memory matches that." : "No memories saved yet."}
                            </CommandEmpty>
                        )}
                        {memories.map((memory) => (
                            <CommandItem
                                key={memory.template_id}
                                value={memory.template_id}
                                onSelect={() => handleSelect(memory)}
                                className="cursor-pointer gap-3"
                            >
                                {memory.is_pinned && <PinIcon className="size-3.5 text-emerald-600" />}
                                <span className="min-w-0 flex-1 truncate font-medium">{memory.template_name}</span>
                                <MemoryChips sections={memory.sections} />
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
