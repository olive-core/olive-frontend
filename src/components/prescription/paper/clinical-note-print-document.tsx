import type { ReactNode } from "react";

import { getHeaderPalette, type ResolvedLetterhead } from "@/lib/header-config";
import { SECTION_LABELS, parseSoapSections, type NoteSection } from "@/lib/soap-notes";
import { ResolvedPrescriptionHeader } from "../header/clinician-prescription-header";
import HeaderAccentRule from "../header/parts/header-accent-rule";
import OliveBrandMark from "../header/parts/olive-brand-mark";
import PrintSheet from "./print-sheet";

// The one printed clinical note, shared by the in-session draft and the saved
// consultation views so the two printouts can never drift apart. The note is a
// clinician-only record: the confidential band under the letterhead and the repeating
// footer make sure a printed note can never be mistaken for a prescription.

interface ClinicalNotePrintDocumentProps {
    letterhead:  ResolvedLetterhead | null;
    notes:       string | null;
    safetyNet:   string[];
    patientSlot: ReactNode;
}

function ConfidentialBand() {
    return (
        <div className="mt-3 flex items-baseline justify-between gap-4 border-y border-slate-300 py-1.5">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
                Clinical Note
            </span>
            <span className="text-[10px] text-slate-900">
                Confidential &mdash; clinician record, not for patient distribution
            </span>
        </div>
    );
}

function NoteRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[30mm_1fr] gap-x-6">
            <h3 className="pt-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-900">
                {label}
            </h3>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
        </div>
    );
}

function SafetyNetRow({ items }: { items: string[] }) {
    if (items.length === 0) return null;

    return (
        <NoteRow label="Safety Net">
            <ul className="flex list-disc flex-col gap-1 pl-4">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </NoteRow>
    );
}

function ClinicalNoteFooter({ letterhead }: { letterhead: ResolvedLetterhead | null }) {
    const palette = letterhead ? getHeaderPalette(letterhead.config) : null;

    return (
        <div>
            <div className="mb-2 flex justify-end">
                <div className="w-[52mm] border-t border-slate-500 pt-1 text-center text-[10px] text-slate-900">
                    Signature
                </div>
            </div>
            {palette && <HeaderAccentRule accent={palette.accent} variant="hairline" className="mb-1.5" />}
            <div className="flex items-end justify-between">
                <p className="text-[10px] text-slate-900">Confidential &mdash; clinician record</p>
                <OliveBrandMark isMono={palette?.isMono ?? true} />
            </div>
        </div>
    );
}

function toNoteSections(notes: string): NoteSection[] {
    const sections = parseSoapSections(notes);
    if (sections) return sections.filter((section) => section.text.trim() !== "");
    return [{ key: "free-text", text: notes }];
}

export default function ClinicalNotePrintDocument({
    letterhead,
    notes,
    safetyNet,
    patientSlot,
}: ClinicalNotePrintDocumentProps) {
    const noteText = (notes ?? "").trim();

    return (
        <PrintSheet
            header={
                <>
                    {letterhead && <ResolvedPrescriptionHeader letterhead={letterhead} />}
                    <ConfidentialBand />
                    {patientSlot}
                </>
            }
            footer={<ClinicalNoteFooter letterhead={letterhead} />}
        >
            <div className="flex flex-col gap-4 pt-2">
                {toNoteSections(noteText).map((section) => (
                    <NoteRow key={section.key} label={SECTION_LABELS[section.key] ?? "Notes"}>
                        {section.text}
                    </NoteRow>
                ))}
                <SafetyNetRow items={safetyNet} />
            </div>
        </PrintSheet>
    );
}
