import { useLayoutEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, LockIcon, PlusIcon, ShieldAlertIcon } from "lucide-react";
import {
    SECTION_LABELS,
    composeSoapNotes,
    parseSoapSections,
    withAllSections,
    type NoteSection,
} from "@/lib/soap-notes";

interface ClinicalNotesPanelProps {
    notes?:     string | null;
    safetyNet?: string[];
    onChange?:  (value: string) => void;
}

function AutoGrowTextarea({
    value,
    placeholder,
    onChange,
    minHeightClass,
    autoFocus,
}: {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    minHeightClass: string;
    autoFocus?: boolean;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    return (
        <textarea
            ref={ref}
            autoFocus={autoFocus}
            className={`w-full rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed resize-none overflow-hidden ${minHeightClass} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
        />
    );
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
    // Sections the clinician opened by hand; filled sections are always visible.
    const [openedKeys, setOpenedKeys] = useState<string[]>([]);

    const handleSectionChange = (key: string, text: string) => {
        onChange(composeSoapNotes(editable.map((s) => (s.key === key ? { ...s, text } : s))));
    };

    const visible = editable.filter((s) => s.text.trim() !== "" || openedKeys.includes(s.key));
    const collapsed = editable.filter((s) => !visible.includes(s));

    return (
        <div className="flex flex-col gap-4">
            {visible.map((section) => (
                <div key={section.key} className="flex flex-col gap-1.5">
                    <SectionHeader label={SECTION_LABELS[section.key]} />
                    <AutoGrowTextarea
                        value={section.text}
                        placeholder={`Add ${SECTION_LABELS[section.key].toLowerCase()} notes...`}
                        onChange={(text) => handleSectionChange(section.key, text)}
                        minHeightClass="min-h-[90px]"
                        autoFocus={openedKeys.includes(section.key) && section.text === ""}
                    />
                </div>
            ))}

            {collapsed.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {collapsed.map((section) => (
                        <button
                            key={section.key}
                            type="button"
                            onClick={() => setOpenedKeys((keys) => [...keys, section.key])}
                            className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
                        >
                            <PlusIcon className="size-3.5" />
                            {SECTION_LABELS[section.key]}
                        </button>
                    ))}
                </div>
            )}
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
                    <AutoGrowTextarea
                        value={noteText}
                        placeholder="Add your clinical notes..."
                        onChange={onChange!}
                        minHeightClass="min-h-[280px]"
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
