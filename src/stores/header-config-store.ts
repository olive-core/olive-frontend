import { create } from "zustand";

import {
    DEFAULT_HEADER_CONFIG,
    type EditableIdentity,
    type HeaderConfig,
    type HeaderCustomField,
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

    addPhone:    () => void;
    updatePhone: (index: number, value: string) => void;
    removePhone: (index: number) => void;

    addCustomField:    () => void;
    updateCustomField: (id: string, changes: Partial<HeaderCustomField>) => void;
    removeCustomField: (id: string) => void;
}

function createCustomField(): HeaderCustomField {
    return { id: crypto.randomUUID(), label: "", value: "" };
}

export const useHeaderConfigStore = create<HeaderConfigStore>((set) => ({
    config:   { ...DEFAULT_HEADER_CONFIG },
    identity: { ...EMPTY_IDENTITY },

    hydrate: (identity, config) => set({ identity, config }),

    reset: () => set({ config: { ...DEFAULT_HEADER_CONFIG }, identity: { ...EMPTY_IDENTITY } }),

    setIdentity: (changes) => set((state) => ({ identity: { ...state.identity, ...changes } })),

    patch: (changes) => set((state) => ({ config: { ...state.config, ...changes } })),

    addPhone: () => set((state) => ({
        config: { ...state.config, phones: [...state.config.phones, ""] },
    })),

    updatePhone: (index, value) => set((state) => ({
        config: {
            ...state.config,
            phones: state.config.phones.map((phone, i) => (i === index ? value : phone)),
        },
    })),

    removePhone: (index) => set((state) => ({
        config: {
            ...state.config,
            phones: state.config.phones.filter((_, i) => i !== index),
        },
    })),

    addCustomField: () => set((state) => ({
        config: { ...state.config, customFields: [...state.config.customFields, createCustomField()] },
    })),

    updateCustomField: (id, changes) => set((state) => ({
        config: {
            ...state.config,
            customFields: state.config.customFields.map((field) =>
                field.id === id ? { ...field, ...changes } : field,
            ),
        },
    })),

    removeCustomField: (id) => set((state) => ({
        config: {
            ...state.config,
            customFields: state.config.customFields.filter((field) => field.id !== id),
        },
    })),
}));
