import type {
    ChiefComplaintType,
    DiagnosisType,
    FollowUpType,
    HistoryType,
    InvestigationType,
    ListInfoFieldName,
    MeedicineType,
} from "@/types/prescription";
import { deserializeMedicine, serializeMedicine, type StoredRxItem } from "@/lib/rx-medicine";

// The saved prescription body a memory holds, as stored in `prescription_template.
// prescription_data`. Vitals, summary and safety net are deliberately absent: they
// describe one patient at one moment, or are Arise's warning about the case in hand.
export interface MemoryBody {
    chief_complaints?: StoredNamedItem[];
    histories?:        StoredNamedItem[];
    diagnoses?:        StoredNamedItem[];
    investigations?:   StoredInvestigation[];
    rx_list?:          StoredRxItem[];
    advice_list?:      string[];
    follow_up_days?:   number | null;
    follow_up_notes?:  string | null;
}

interface StoredNamedItem {
    name_text: string;
    duration?: string;
    notes?:    string;
}

interface StoredInvestigation {
    name_text: string;
    reason?:   string;
    priority?: string;
}

// Every section a memory can carry, and the prescription-store field each one fills.
export interface MemorySectionValues {
    chiefComplaint: ChiefComplaintType[];
    history:        HistoryType[];
    diagnosis:      DiagnosisType[];
    investigation:  InvestigationType[];
    medicine:       MeedicineType[];
    advice:         string[];
    followUp:       FollowUpType;
}

export type MemorySectionKey = keyof MemorySectionValues;

interface MemorySectionDefinition<K extends MemorySectionKey> {
    label: string;
    /** Shown as a chip on a search result, so the doctor sees what a memory fills before applying it. */
    chip: string;
    /** The section's name in the API — what the library search narrows on. */
    apiKey: string;
    /** Drops the half-written entries an editor leaves behind, so a memory never saves a blank row. */
    sanitize: (value: MemorySectionValues[K]) => MemorySectionValues[K];
    isEmpty: (value: MemorySectionValues[K]) => boolean;
    fromMemoryBody: (body: MemoryBody) => MemorySectionValues[K];
    toMemoryBody: (value: MemorySectionValues[K]) => MemoryBody;
}

type MemorySectionDefinitions = { [K in MemorySectionKey]: MemorySectionDefinition<K> };

export const EMPTY_FOLLOW_UP: FollowUpType = { follow_up_days: null, follow_up_notes: null };

const hasName = <T extends { name: string }>(item: T) => item.name.trim().length > 0;

export const MEMORY_SECTION_DEFINITIONS: MemorySectionDefinitions = {
    chiefComplaint: {
        label: "Chief complaint",
        chip: "CC",
        apiKey: "chief_complaint",
        sanitize: (items) => items.filter(hasName),
        isEmpty: (items) => items.length === 0,
        fromMemoryBody: (body) => (body.chief_complaints ?? []).map(toStoreNamedItem),
        toMemoryBody: (items) => ({ chief_complaints: items.map(toStoredNamedItem) }),
    },
    history: {
        label: "History",
        chip: "Hx",
        apiKey: "history",
        sanitize: (items) => items.filter(hasName),
        isEmpty: (items) => items.length === 0,
        fromMemoryBody: (body) => (body.histories ?? []).map(toStoreNamedItem),
        toMemoryBody: (items) => ({ histories: items.map(toStoredNamedItem) }),
    },
    diagnosis: {
        label: "Diagnosis",
        chip: "Dx",
        apiKey: "diagnosis",
        sanitize: (items) => items.filter(hasName),
        isEmpty: (items) => items.length === 0,
        // A memory carries the diagnosis itself; the ICD code and Arise's confidence
        // and reasoning belong to the consultation that produced them.
        fromMemoryBody: (body) => (body.diagnoses ?? []).map((item) => ({ name: item.name_text })),
        toMemoryBody: (items) => ({ diagnoses: items.map((item) => ({ name_text: item.name })) }),
    },
    investigation: {
        label: "Investigation",
        chip: "Ix",
        apiKey: "investigation",
        sanitize: (items) => items.filter(hasName),
        isEmpty: (items) => items.length === 0,
        fromMemoryBody: (body) =>
            (body.investigations ?? []).map((item) => ({
                name: item.name_text,
                notes: item.reason ?? "",
                priority: item.priority || "routine",
            })),
        toMemoryBody: (items) => ({
            investigations: items.map((item) => ({
                name_text: item.name,
                reason: item.notes ?? "",
                priority: item.priority || "routine",
            })),
        }),
    },
    medicine: {
        label: "Medicine",
        chip: "Rx",
        apiKey: "medicine",
        sanitize: (items) => items.filter((item) => (item.name || item.value || "").trim().length > 0),
        isEmpty: (items) => items.length === 0,
        fromMemoryBody: (body) => (body.rx_list ?? []).map(deserializeMedicine),
        toMemoryBody: (items) => ({ rx_list: items.map(serializeMedicine) }),
    },
    advice: {
        label: "Advice",
        chip: "Adv",
        apiKey: "advice",
        sanitize: (lines) => lines.map((line) => line.trim()).filter(Boolean),
        isEmpty: (lines) => lines.length === 0,
        fromMemoryBody: (body) => body.advice_list ?? [],
        toMemoryBody: (lines) => ({ advice_list: lines }),
    },
    followUp: {
        label: "Follow-up",
        chip: "F/U",
        apiKey: "follow_up",
        sanitize: (value) => ({
            // A zero-day interval is how "no follow-up" is stored, so it never counts as set.
            follow_up_days: value.follow_up_days || null,
            follow_up_notes: value.follow_up_notes?.trim() || null,
        }),
        isEmpty: (value) => !value.follow_up_days && !value.follow_up_notes,
        fromMemoryBody: (body) => ({
            follow_up_days: body.follow_up_days ?? null,
            follow_up_notes: body.follow_up_notes ?? null,
        }),
        toMemoryBody: (value) => ({
            follow_up_days: value.follow_up_days,
            follow_up_notes: value.follow_up_notes,
        }),
    },
};

// Declaration order — drives the chip order on a search result and the order of the
// "This memory fills" line, so both read the way the prescription does.
const MEMORY_SECTIONS = Object.keys(MEMORY_SECTION_DEFINITIONS) as MemorySectionKey[];

export const MEMORY_SECTION_BY_FIELD_NAME: Record<ListInfoFieldName, MemorySectionKey> = {
    "chief-complaint": "chiefComplaint",
    "history":         "history",
    "diagnosis":       "diagnosis",
    "investigation":   "investigation",
};

export function memorySectionLabel(key: MemorySectionKey): string {
    return MEMORY_SECTION_DEFINITIONS[key].label;
}

export function memorySectionApiKey(key: MemorySectionKey): string {
    return MEMORY_SECTION_DEFINITIONS[key].apiKey;
}

export function memorySectionChips(apiKeys: string[]): string[] {
    return MEMORY_SECTIONS
        .filter((key) => apiKeys.includes(MEMORY_SECTION_DEFINITIONS[key].apiKey))
        .map((key) => MEMORY_SECTION_DEFINITIONS[key].chip);
}

export function isMemorySectionFilled<K extends MemorySectionKey>(key: K, value: MemorySectionValues[K]): boolean {
    const definition = MEMORY_SECTION_DEFINITIONS[key] as MemorySectionDefinition<K>;
    return !definition.isEmpty(definition.sanitize(value));
}

// Which sections the doctor has actually filled in. Never stored — a memory is described
// by its contents, so the two can never disagree.
export function filledMemorySections(values: Partial<MemorySectionValues>): MemorySectionKey[] {
    return MEMORY_SECTIONS.filter((key) => {
        const value = values[key];
        return value !== undefined && isMemorySectionFilled(key, value);
    });
}

export function memoryBodyFromSections(values: MemorySectionValues): MemoryBody {
    return filledMemorySections(values).reduce<MemoryBody>(
        (body, key) => ({ ...body, ...toMemoryBody(key, sanitizeSection(key, values[key])) }),
        {},
    );
}

/** Every section, empty ones included — how the memory editor loads a saved memory. */
export function memorySectionValues(body: MemoryBody): MemorySectionValues {
    return MEMORY_SECTIONS.reduce(
        (values, key) => ({ ...values, [key]: MEMORY_SECTION_DEFINITIONS[key].fromMemoryBody(body) }),
        {} as MemorySectionValues,
    );
}

// What applying a memory writes onto a prescription. Sections the memory leaves blank are
// absent from the patch, so whatever is already on the prescription there stays untouched.
// Contents are sanitized on the way out too, so a memory saved before that rule existed
// cannot drop a half-written row onto a patient's prescription.
export function filledMemorySectionValues(
    body: MemoryBody,
    only?: MemorySectionKey[],
): Partial<MemorySectionValues> {
    const values = memorySectionValues(body);
    const wanted = only ?? MEMORY_SECTIONS;
    return filledMemorySections(values)
        .filter((key) => wanted.includes(key))
        .reduce<Partial<MemorySectionValues>>(
            (patch, key) => ({ ...patch, [key]: sanitizeSection(key, values[key]) }),
            {},
        );
}

// ─── Provenance ─────────────────────────────────────────────────────────────
// Which memory a prescription section currently holds. Applying replaces rather than
// blends, so a whole section comes from one memory at a time — that is what lets undo
// put back exactly what was there, however many memories are applied in a session.

export type MemorySectionValue = MemorySectionValues[MemorySectionKey];

export interface AppliedMemory {
    memoryName: string;
    /** The section's contents immediately before this apply — what undo restores. */
    replaced: MemorySectionValue;
    /** What the apply wrote, so an edit since then is visible by identity alone. */
    applied: MemorySectionValue;
}

export type AppliedMemories = Partial<Record<MemorySectionKey, AppliedMemory>>;

// A generated draft never overwrites a section a memory owns: the memory is the doctor's
// own answer for this kind of case and takes precedence over anything generated.
export function omitMemoryOwnedSections<T extends Partial<MemorySectionValues>>(
    patch: T,
    applied: AppliedMemories,
): Partial<T> {
    return Object.fromEntries(
        Object.entries(patch).filter(([key]) => !applied[key as MemorySectionKey]),
    ) as Partial<T>;
}

function sanitizeSection<K extends MemorySectionKey>(key: K, value: MemorySectionValues[K]) {
    return (MEMORY_SECTION_DEFINITIONS[key].sanitize as (v: MemorySectionValues[K]) => MemorySectionValues[K])(value);
}

function toMemoryBody<K extends MemorySectionKey>(key: K, value: MemorySectionValues[K]) {
    return (MEMORY_SECTION_DEFINITIONS[key] as MemorySectionDefinition<K>).toMemoryBody(value);
}

function toStoreNamedItem(item: StoredNamedItem) {
    return { name: item.name_text, duration: item.duration ?? "", notes: item.notes ?? "" };
}

function toStoredNamedItem(item: { name: string; duration?: string; notes?: string }): StoredNamedItem {
    return { name_text: item.name, duration: item.duration ?? "", notes: item.notes ?? "" };
}
