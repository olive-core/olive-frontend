import { useState } from "react";
import { CheckIcon, CopyIcon, LockIcon, ShieldAlertIcon } from "lucide-react";

interface ClinicalNotesPanelProps {
    notes?:     string | null;
    safetyNet?: string[];
    onChange?:  (value: string) => void;
}

// The backend composes notes as "S: ...\n\nO: ...\n\nA: ..." (gate.compose_summary).
// We render those markers as full section headers, and recompose the identical
// string on edit so the stored format never changes.
const SECTION_LABELS: Record<string, string> = {
    S: "Subjective",
    O: "Objective",
    A: "Assessment",
};

const SECTION_ORDER = ["S", "O", "A"];

interface NoteSection {
    key:  string;
    text: string;
}

function parseSoapSections(text: string): NoteSection[] | null {
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

function composeSoapNotes(sections: NoteSection[]): string {
    return sections
        .filter((section) => section.text.trim() !== "")
        .map((section) => `${section.key}: ${section.text}`)
        .join("\n\n");
}

function withAllSections(sections: NoteSection[]): NoteSection[] {
    return SECTION_ORDER.map((key) => sections.find((s) => s.key === key) ?? { key, text: "" });
}

function SafetyNetCallout({ items }: { items: string[] }) {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2">
                <ShieldAlertIcon className="size-4 text-amber-600" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-amber-700">
                    Safety Net
                </h4>
                <span className="text-[11px] font-medium text-amber-600">AI-flagged · please review</span>
            </div>
            <ul className="list-disc pl-5 text-sm leading-relaxed text-amber-900 flex flex-col gap-1">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function CopyNotesButton({ notes }: { notes: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(notes);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            title="Copy clinical notes"
        >
            {copied
                ? <><CheckIcon className="size-3.5 text-emerald-600" /> Copied</>
                : <><CopyIcon className="size-3.5" /> Copy</>
            }
        </button>
    );
}

function SectionHeader({ label }: { label: string }) {
    return (
        <h4 className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-emerald-700">
            <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
            {label}
        </h4>
    );
}

function SectionedNotesEditor({
    sections,
    onChange,
}: {
    sections: NoteSection[];
    onChange: (value: string) => void;
}) {
    const editable = withAllSections(sections);

    const handleSectionChange = (key: string, text: string) => {
        onChange(composeSoapNotes(editable.map((s) => (s.key === key ? { ...s, text } : s))));
    };

    return (
        <div className="flex flex-col gap-4">
            {editable.map((section) => (
                <div key={section.key} className="flex flex-col gap-1.5">
                    <SectionHeader label={SECTION_LABELS[section.key]} />
                    <textarea
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed resize-y min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={section.text}
                        placeholder={`Add ${SECTION_LABELS[section.key].toLowerCase()} notes...`}
                        onChange={(e) => handleSectionChange(section.key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}

function SectionedNotesView({ sections }: { sections: NoteSection[] }) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted px-4 py-4">
            {sections.filter((s) => s.text.trim() !== "").map((section) => (
                <div key={section.key} className="flex flex-col gap-1.5">
                    <SectionHeader label={SECTION_LABELS[section.key]} />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{section.text}</p>
                </div>
            ))}
        </div>
    );
}

export default function ClinicalNotesPanel({ notes, safetyNet, onChange }: ClinicalNotesPanelProps) {
    const isEditable = onChange !== undefined;
    const noteText = notes ?? "";
    const sections = parseSoapSections(noteText);
    // Empty notes still get the sectioned editor; unparseable free text keeps the plain blob.
    const useSections = sections !== null || noteText.trim() === "";

    return (
        <div className="flex flex-col gap-3 p-4">
            <SafetyNetCallout items={safetyNet ?? []} />

            <div className="flex items-center gap-2">
                <LockIcon className="size-4 text-slate-400" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">
                    Clinical Notes
                </h3>
                {noteText.trim() !== "" && <CopyNotesButton notes={noteText} />}
            </div>

            <p className="text-xs text-slate-400">
                Private &middot; only you can see this. Not shared with the patient and not printed.
            </p>

            {isEditable ? (
                useSections ? (
                    <SectionedNotesEditor sections={sections ?? []} onChange={onChange!} />
                ) : (
                    <textarea
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed resize-y min-h-[280px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={noteText}
                        placeholder="Add your clinical notes..."
                        onChange={(e) => onChange!(e.target.value)}
                    />
                )
            ) : sections !== null ? (
                <SectionedNotesView sections={sections} />
            ) : (
                <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[280px]">
                    {noteText.trim()
                        ? noteText
                        : <span className="text-slate-400 italic">No clinical notes.</span>
                    }
                </div>
            )}
        </div>
    );
}
