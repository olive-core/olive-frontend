import { createContext, useContext } from "react";

// Memory fills prescription sections, so its controls belong on a prescription being
// written and nowhere else — not inside the memory editor itself, and not in a note-only
// consultation. Every section carries its controls; this is what switches them on.
export const MemoryApplyEnabledContext = createContext(false);

export function useMemoryApplyEnabled(): boolean {
    return useContext(MemoryApplyEnabledContext);
}
