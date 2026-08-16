import { Undo2Icon } from "lucide-react";

import { selectMemoryUndo, usePrescriptionStore } from "@/stores/prescription-store";
import type { MemorySectionKey } from "@/lib/memory";
import { useMemoryApplyEnabled } from "./memory-apply-context";

// Applying a memory replaces what a section held. This puts back exactly what was there,
// which is what makes replacing safe to do without asking the doctor first.
export default function MemoryUndoBar({ section }: { section: MemorySectionKey }) {
    const isEnabled = useMemoryApplyEnabled();
    const undo = usePrescriptionStore((state) => selectMemoryUndo(state, section));
    const undoMemorySection = usePrescriptionStore((state) => state.undoMemorySection);

    if (!isEnabled || !undo) return null;

    return (
        <div className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600">
            <span className="min-w-0 flex-1 truncate">
                Replaced by <span className="font-semibold text-slate-800">{undo.memoryName}</span>
            </span>
            <button
                type="button"
                onClick={() => undoMemorySection(section)}
                className="flex min-h-9 shrink-0 cursor-pointer items-center gap-1 px-1 font-bold text-slate-700 underline underline-offset-2 hover:text-slate-900 sm:min-h-0 sm:px-0"
            >
                <Undo2Icon className="size-3" />
                Undo
            </button>
        </div>
    );
}
