import { Reorder, useDragControls } from "motion/react";
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";

import {
    CONTACT_LINE_KIND_META,
    CONTACT_LINE_KINDS,
    type ContactLine,
    type ContactLineKind,
} from "@/lib/header-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContactLineIcon from "../../parts/contact-line-icon";
import { controlId } from "../focus-field";

// The reusable drag-reorderable contact-line list, shared by every chamber pad editor
// (the editor's chamber sections and its first-run setup). Line ids are globally unique
// (crypto.randomUUID), so `contact-<id>` focus keys stay unambiguous.

export interface ContactLinesEditorProps {
    lines:     ContactLine[];
    onAdd:     (kind: ContactLineKind) => void;
    onUpdate:  (id: string, changes: Partial<ContactLine>) => void;
    onRemove:  (id: string) => void;
    onReorder: (lines: ContactLine[]) => void;
}

function LineValueField({ line, update }: { line: ContactLine; update: ContactLinesEditorProps["onUpdate"] }) {
    const meta = CONTACT_LINE_KIND_META[line.kind];

    if (line.kind === "address") {
        return (
            <textarea
                id={controlId(`contact-${line.id}`)}
                value={line.value}
                onChange={(event) => update(line.id, { value: event.target.value })}
                placeholder={meta.placeholder}
                rows={2}
                className="min-h-11 w-full resize-y rounded-md border border-input bg-transparent px-3 py-1.5 text-base shadow-xs outline-none [field-sizing:content] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] sm:min-h-9 md:text-sm"
            />
        );
    }

    return (
        <Input
            id={controlId(`contact-${line.id}`)}
            value={line.value}
            onChange={(event) => update(line.id, { value: event.target.value })}
            placeholder={meta.placeholder}
            className="h-11 sm:h-9"
        />
    );
}

interface ContactLineRowProps {
    line:   ContactLine;
    update: ContactLinesEditorProps["onUpdate"];
    remove: ContactLinesEditorProps["onRemove"];
}

// A draggable contact row. Drag is bound to the grip handle only (dragListener=false) so the
// text inputs stay fully editable. A phone gives the value its own full-width line — sharing
// one line with the grip, the kind and the remove button left it too narrow to read back
// what was typed — and names the kind in words, since the icon's tooltip never opens on a
// touch screen.
function ContactLineRow({ line, update, remove }: ContactLineRowProps) {
    const dragControls = useDragControls();
    const meta = CONTACT_LINE_KIND_META[line.kind];

    return (
        <Reorder.Item
            as="div"
            value={line}
            dragListener={false}
            dragControls={dragControls}
            data-contact-row
            className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-white p-1.5"
        >
            <button
                type="button"
                aria-label="Drag to reorder"
                onPointerDown={(event) => dragControls.start(event)}
                className="min-h-11 cursor-grab touch-none rounded p-1 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing sm:min-h-0"
            >
                <GripVerticalIcon className="size-4" />
            </button>

            <span
                title={meta.label}
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400"
            >
                <ContactLineIcon kind={line.kind} className="size-3.5" />
            </span>

            {line.kind === "custom" ? (
                <Input
                    value={line.label}
                    onChange={(event) => update(line.id, { label: event.target.value })}
                    placeholder="Label"
                    className="h-11 min-w-0 flex-1 sm:h-9 sm:max-w-[30%] sm:flex-none"
                />
            ) : (
                <span className="flex-1 text-xs font-medium text-slate-500 sm:hidden">{meta.label}</span>
            )}

            {/* Keeps the DOM order the tab order — grip, kind, value, remove — while the
                phone drops the value onto its own line underneath. */}
            <div className="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
                <LineValueField line={line} update={update} />
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${meta.label.toLowerCase()}`}
                className="ml-auto size-11 sm:ml-0 sm:size-8"
                onClick={() => remove(line.id)}
            >
                <XIcon className="size-4" />
            </Button>
        </Reorder.Item>
    );
}

export default function ContactLinesEditor({ lines, onAdd, onUpdate, onRemove, onReorder }: ContactLinesEditorProps) {
    return (
        <>
            {lines.length > 0 && (
                <Reorder.Group as="div" axis="y" values={lines} onReorder={onReorder} className="flex flex-col gap-1.5">
                    {lines.map((line) => (
                        <ContactLineRow key={line.id} line={line} update={onUpdate} remove={onRemove} />
                    ))}
                </Reorder.Group>
            )}

            <div className="flex flex-wrap gap-1.5">
                {CONTACT_LINE_KINDS.map((kind: ContactLineKind) => (
                    <Button key={kind} type="button" variant="outline" size="sm" className="min-h-11 sm:min-h-8" onClick={() => onAdd(kind)}>
                        <PlusIcon className="size-3.5" />
                        {CONTACT_LINE_KIND_META[kind].label}
                    </Button>
                ))}
            </div>
        </>
    );
}
