import { create } from "zustand";

import {
    DEFAULT_HEADER_CONFIG,
    newContactLine,
    type ContactLine,
    type ContactLineKind,
    type EditableIdentity,
    type HeaderConfig,
} from "@/lib/header-config";

// The doctor's identity is edited here too (name/qualification/BMDC live on the profile,
// not in header_config) so the live preview reacts to those edits as well.
const EMPTY_IDENTITY: EditableIdentity = { firstName: "", lastName: "", qualification: "", bmdcNo: "" };

// Holds the letterhead currently being edited. The control panel writes to it and the
// live preview subscribes to it, so every keystroke reflects instantly in the preview.
interface HeaderConfigStore {
    config:   HeaderConfig;
    identity: EditableIdentity;

    hydrate: (identity: EditableIdentity, config: HeaderConfig) => void;
    reset:   () => void;

    setIdentity: (changes: Partial<EditableIdentity>) => void;
    patch:       (changes: Partial<HeaderConfig>) => void;

    addContactLine:     (kind: ContactLineKind) => void;
    updateContactLine:  (id: string, changes: Partial<ContactLine>) => void;
    removeContactLine:  (id: string) => void;
    reorderContactLines: (lines: ContactLine[]) => void;
}

export const useHeaderConfigStore = create<HeaderConfigStore>((set) => ({
    config:   { ...DEFAULT_HEADER_CONFIG },
    identity: { ...EMPTY_IDENTITY },

    hydrate: (identity, config) => set({ identity, config }),

    reset: () => set({ config: { ...DEFAULT_HEADER_CONFIG }, identity: { ...EMPTY_IDENTITY } }),

    setIdentity: (changes) => set((state) => ({ identity: { ...state.identity, ...changes } })),

    patch: (changes) => set((state) => ({ config: { ...state.config, ...changes } })),

    addContactLine: (kind) => set((state) => ({
        config: { ...state.config, contactLines: [...state.config.contactLines, newContactLine(kind)] },
    })),

    updateContactLine: (id, changes) => set((state) => ({
        config: {
            ...state.config,
            contactLines: state.config.contactLines.map((line) =>
                line.id === id ? { ...line, ...changes } : line,
            ),
        },
    })),

    removeContactLine: (id) => set((state) => ({
        config: {
            ...state.config,
            contactLines: state.config.contactLines.filter((line) => line.id !== id),
        },
    })),

    reorderContactLines: (lines) => set((state) => ({
        config: { ...state.config, contactLines: lines },
    })),
}));
