import { create } from "zustand";

import {
    DEFAULT_HEADER_CONFIG,
    newContactLine,
    type ContactLine,
    type ContactLineKind,
    type EditableIdentity,
    type HeaderConfig,
} from "@/lib/header-config";
import { padFromApi, type ChamberPad } from "@/lib/chamber-pad";
import type { Chamber } from "@/types/attendant-queue";

// The doctor's identity is edited here too (name/qualification/BMDC live on the profile,
// not in header_config) so the live preview reacts to those edits as well.
const EMPTY_IDENTITY: EditableIdentity = { name: "", qualification: "", bmdcNo: "" };

export type EditorTab = "style" | "doctor" | "chambers" | "footer";

// Holds the letterhead currently being edited: the doctor's global style config plus
// one pad per chamber. The control panel writes to it and the live preview subscribes
// to it, so every keystroke reflects instantly in the preview.
interface HeaderConfigStore {
    config:   HeaderConfig;
    identity: EditableIdentity;

    // Per-chamber pads being edited, keyed by chamber_id. `chambers` is the metadata
    // (hospital name, room) the pads hang off; `dirtyPadIds` tracks which pads need a
    // PUT on save. `previewChamberId` is the session the preview pretends to be
    // (null = no chamber selected).
    chambers:         Chamber[];
    pads:             Record<string, ChamberPad>;
    dirtyPadIds:      string[];
    previewChamberId: string | null;

    // Editor chrome the focus bridge needs to drive (click-to-edit across tabs).
    activeTab: EditorTab;
    openPadId: string | null;

    hydrate: (identity: EditableIdentity, config: HeaderConfig) => void;
    hydratePads: (chambers: Chamber[]) => void;
    reset:   () => void;

    setIdentity: (changes: Partial<EditableIdentity>) => void;
    patch:       (changes: Partial<HeaderConfig>) => void;

    addContactLine:     (kind: ContactLineKind) => void;
    updateContactLine:  (id: string, changes: Partial<ContactLine>) => void;
    removeContactLine:  (id: string) => void;
    reorderContactLines: (lines: ContactLine[]) => void;

    setPreviewChamber: (chamberId: string | null) => void;
    setActiveTab:      (tab: EditorTab) => void;
    setOpenPadId:      (chamberId: string | null) => void;

    patchPad:        (chamberId: string, changes: Partial<ChamberPad>) => void;
    padAddLine:      (chamberId: string, kind: ContactLineKind) => void;
    padUpdateLine:   (chamberId: string, lineId: string, changes: Partial<ContactLine>) => void;
    padRemoveLine:   (chamberId: string, lineId: string) => void;
    padReorderLines: (chamberId: string, lines: ContactLine[]) => void;
    markPadsClean:   (chamberIds: string[]) => void;
}

function markDirty(dirtyPadIds: string[], chamberId: string): string[] {
    return dirtyPadIds.includes(chamberId) ? dirtyPadIds : [...dirtyPadIds, chamberId];
}

export const useHeaderConfigStore = create<HeaderConfigStore>((set) => {
    const updatePad = (chamberId: string, mutate: (pad: ChamberPad) => ChamberPad) =>
        set((state) => {
            const pad = state.pads[chamberId];
            if (!pad) return state;
            return {
                pads: { ...state.pads, [chamberId]: mutate(pad) },
                dirtyPadIds: markDirty(state.dirtyPadIds, chamberId),
            };
        });

    return {
        config:   { ...DEFAULT_HEADER_CONFIG },
        identity: { ...EMPTY_IDENTITY },

        chambers:         [],
        pads:             {},
        dirtyPadIds:      [],
        previewChamberId: null,

        activeTab: "style",
        openPadId: null,

        hydrate: (identity, config) => set({ identity, config }),

        // Pads hydrate separately (the chambers query resolves after the profile). Unsaved
        // edits win over a refetch so typing never gets clobbered; dirty ids for chambers
        // that no longer exist (deleted) are dropped so save never PUTs a dead chamber.
        // The preview defaults to the doctor's first chamber (once, on initial load) so
        // the editor opens on a populated, realistic preview instead of the empty
        // "no chamber" state.
        hydratePads: (chambers) => set((state) => {
            const pads: Record<string, ChamberPad> = {};
            for (const chamber of chambers) {
                pads[chamber.chamber_id] = state.dirtyPadIds.includes(chamber.chamber_id)
                    ? state.pads[chamber.chamber_id]
                    : padFromApi(chamber.pad_config);
            }
            // Only auto-select on the very first hydration after a reset — later refetches
            // (e.g. after saving a pad) must never override a preview the doctor picked.
            const isFirstHydration = state.chambers.length === 0;
            const previewChamberId = isFirstHydration && state.previewChamberId === null
                ? (chambers[0]?.chamber_id ?? null)
                : state.previewChamberId;
            return {
                chambers,
                pads,
                previewChamberId,
                dirtyPadIds: state.dirtyPadIds.filter((id) => pads[id]),
            };
        }),

        reset: () => set({
            config:   { ...DEFAULT_HEADER_CONFIG },
            identity: { ...EMPTY_IDENTITY },
            chambers: [],
            pads: {},
            dirtyPadIds: [],
            previewChamberId: null,
            activeTab: "style",
            openPadId: null,
        }),

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

        setPreviewChamber: (chamberId) => set({ previewChamberId: chamberId }),
        setActiveTab:      (tab) => set({ activeTab: tab }),
        setOpenPadId:      (chamberId) => set({ openPadId: chamberId }),

        patchPad: (chamberId, changes) => updatePad(chamberId, (pad) => ({ ...pad, ...changes })),

        padAddLine: (chamberId, kind) => updatePad(chamberId, (pad) => ({
            ...pad,
            contactLines: [...pad.contactLines, newContactLine(kind)],
        })),

        padUpdateLine: (chamberId, lineId, changes) => updatePad(chamberId, (pad) => ({
            ...pad,
            contactLines: pad.contactLines.map((line) => (line.id === lineId ? { ...line, ...changes } : line)),
        })),

        padRemoveLine: (chamberId, lineId) => updatePad(chamberId, (pad) => ({
            ...pad,
            contactLines: pad.contactLines.filter((line) => line.id !== lineId),
        })),

        padReorderLines: (chamberId, lines) => updatePad(chamberId, (pad) => ({ ...pad, contactLines: lines })),

        markPadsClean: (chamberIds) => set((state) => ({
            dirtyPadIds: state.dirtyPadIds.filter((id) => !chamberIds.includes(id)),
        })),
    };
});
