import type { InvestigationType } from "@/types/prescription";
import { deserializeMedicine, type StoredRxItem } from "@/lib/rx-medicine";

// Single source of truth for which prescription sections an RxMemory carries. Changing this list
// changes — together, in one place — which sections the RxMemory editor shows and which sections an
// RxMemory replaces (or appends to) when applied onto a prescription. Each key is also the matching
// field name in the prescription store.
export const RX_MEMORY_SECTIONS = ["medicine", "investigation"] as const;
export type RxMemorySectionKey = (typeof RX_MEMORY_SECTIONS)[number];

type MergeStrategy = "replace" | "append";

interface RxMemoryTemplateData {
    rx_list?: StoredRxItem[];
    investigations?: TemplateInvestigation[];
}

interface TemplateInvestigation {
    name_text?: string;
    reason?: string;
    priority?: string;
}

interface RxMemorySectionDefinition {
    label: string;
    strategy: MergeStrategy;
    // Maps a saved RxMemory's prescription_data into this section's prescription-store shape.
    fromTemplateData: (data: RxMemoryTemplateData) => unknown[];
}

function toStoreInvestigation(item: TemplateInvestigation): InvestigationType {
    return {
        name: item.name_text || "",
        notes: item.reason || "",
        priority: item.priority || "routine",
    };
}

export const RX_MEMORY_SECTION_DEFINITIONS: Record<RxMemorySectionKey, RxMemorySectionDefinition> = {
    medicine: {
        label: "Medicine",
        strategy: "replace",
        fromTemplateData: (data) => (data.rx_list ?? []).map(deserializeMedicine),
    },
    investigation: {
        label: "Investigation",
        strategy: "replace",
        fromTemplateData: (data) => (data.investigations ?? []).map(toStoreInvestigation),
    },
};

export function isRxMemorySection(key: string): boolean {
    return (RX_MEMORY_SECTIONS as readonly string[]).includes(key);
}

// Store patch that applies a saved RxMemory onto the current prescription, honouring each section's
// merge strategy: "replace" overwrites the section, "append" adds to whatever is already there.
export function applyRxMemoryToStore(
    data: RxMemoryTemplateData,
    current: Record<string, unknown[]>,
): Record<string, unknown[]> {
    const patch: Record<string, unknown[]> = {};
    for (const key of RX_MEMORY_SECTIONS) {
        const { strategy, fromTemplateData } = RX_MEMORY_SECTION_DEFINITIONS[key];
        const incoming = fromTemplateData(data);
        patch[key] = strategy === "append" ? [...(current[key] ?? []), ...incoming] : incoming;
    }
    return patch;
}

// Keeps only the entries for RxMemory-covered sections — used to snapshot the AI-generated version
// of those sections so "Revert to generated" can restore exactly them.
export function pickRxMemorySections<T>(byKey: Record<string, T>): Record<string, T> {
    return Object.fromEntries(
        Object.entries(byKey).filter(([key]) => isRxMemorySection(key)),
    );
}

// The complement of pickRxMemorySections — the sections a generated draft owns outright and always
// writes, regardless of any applied RxMemory.
export function omitRxMemorySections<T>(byKey: Record<string, T>): Record<string, T> {
    return Object.fromEntries(
        Object.entries(byKey).filter(([key]) => !isRxMemorySection(key)),
    );
}

// Empty values for every covered section — used to clear them while a fresh draft is still streaming.
export function clearedRxMemorySections(): Record<string, never[]> {
    return Object.fromEntries(RX_MEMORY_SECTIONS.map((key) => [key, []]));
}
