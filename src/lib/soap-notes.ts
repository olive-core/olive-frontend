// The backend composes clinical notes as "S: ...\n\nO: ...\n\nA: ..." (gate.compose_summary).
// These helpers parse that string into labeled sections and recompose the identical
// format, so the stored note never changes shape.

export const SECTION_LABELS: Record<string, string> = {
    S: "Subjective",
    O: "Objective",
    A: "Assessment",
};

export const SECTION_ORDER = ["S", "O", "A"];

export interface NoteSection {
    key:  string;
    text: string;
}

export function parseSoapSections(text: string): NoteSection[] | null {
    const markers = [...text.matchAll(/^([SOA]):[ \t]*/gm)];
    if (markers.length === 0) return null;
    // Anything before the first marker means free-form text — don't force sections on it.
    if (text.slice(0, markers[0].index).trim() !== "") return null;

    return markers.map((marker, i) => {
        const start = marker.index! + marker[0].length;
        const end = i + 1 < markers.length ? markers[i + 1].index! : text.length;
        return { key: marker[1], text: text.slice(start, end).trim() };
    });
}

export function composeSoapNotes(sections: NoteSection[]): string {
    return sections
        .filter((section) => section.text.trim() !== "")
        .map((section) => `${section.key}: ${section.text}`)
        .join("\n\n");
}

export function withAllSections(sections: NoteSection[]): NoteSection[] {
    return SECTION_ORDER.map((key) => sections.find((s) => s.key === key) ?? { key, text: "" });
}
