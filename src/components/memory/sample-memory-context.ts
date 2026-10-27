import { createContext } from "react";
import type { MemoryBody } from "@/lib/memory";
import type { MemorySummary } from "@/hooks/use-memory-library";

export interface SampleMemory extends MemorySummary {
    prescription_data: MemoryBody;
}

// null means the signed-in doctor's library. A demo supplies only curated examples.
export const SampleMemoryContext = createContext<SampleMemory[] | null>(null);
