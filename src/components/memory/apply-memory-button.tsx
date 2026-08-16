import { useState } from "react";
import { BookMarkedIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useApplyMemory, type MemorySummary } from "@/hooks/use-memory-library";
import { memorySectionLabel, type MemorySectionKey } from "@/lib/memory";
import { useMemoryApplyEnabled } from "./memory-apply-context";
import MemoryPicker from "./memory-picker";

function useMemoryPicker(section?: MemorySectionKey) {
    const [isOpen, setIsOpen] = useState(false);
    const applyMemory = useApplyMemory(section);

    return {
        isOpen,
        setIsOpen,
        isApplying: applyMemory.isPending,
        open: () => setIsOpen(true),
        select: (memory: MemorySummary) => applyMemory.mutate(memory),
    };
}

/** Applies a whole memory: every section it carries, in one action. */
export function ApplyMemoryButton() {
    const isEnabled = useMemoryApplyEnabled();
    const picker = useMemoryPicker();

    if (!isEnabled) return null;

    return (
        <>
            <Button variant="outline" onClick={picker.open} disabled={picker.isApplying}>
                {picker.isApplying ? <Loader2Icon className="size-4 animate-spin" /> : <BookMarkedIcon className="size-4" />}
                Apply memory
            </Button>
            <MemoryPicker open={picker.isOpen} onOpenChange={picker.setIsOpen} onSelect={picker.select} />
        </>
    );
}

/** Fills one section from any memory that has something in it, leaving the rest alone. */
export function SectionMemoryButton({ section }: { section: MemorySectionKey }) {
    const isEnabled = useMemoryApplyEnabled();
    const picker = useMemoryPicker(section);

    if (!isEnabled) return null;

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                aria-label={`Fill ${memorySectionLabel(section).toLowerCase()} from a memory`}
                className="h-11 w-11 px-2 text-xs font-bold text-slate-500 hover:bg-slate-100 sm:h-7 sm:w-auto"
                onClick={picker.open}
                disabled={picker.isApplying}
            >
                {picker.isApplying ? <Loader2Icon className="size-3 animate-spin" /> : <BookMarkedIcon className="size-3" />}
            </Button>
            <MemoryPicker
                open={picker.isOpen}
                onOpenChange={picker.setIsOpen}
                section={section}
                onSelect={picker.select}
            />
        </>
    );
}
