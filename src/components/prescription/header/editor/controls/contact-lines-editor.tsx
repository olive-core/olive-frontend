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
// (the header editor's Chambers tab and the profile's chamber page). Line ids are
// globally unique (crypto.randomUUID), so `contact-<id>` focus keys stay unambiguous.

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
                rows={1}
                className="min-h-9 w-full resize-y rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
        );
    }

    return (
        <Input
            id={controlId(`contact-${line.id}`)}
            value={line.value}
            onChange={(event) => update(line.id, { value: event.target.value })}
            placeholder={meta.placeholder}
        />
    );
}

interface ContactLineRowProps {
    line:   ContactLine;
    update: ContactLinesEditorProps["onUpdate"];
    remove: ContactLinesEditorProps["onRemove"];
}

// A draggable contact row. Drag is bound to the grip handle only (dragListener=false) so the
// text inputs stay fully editable.
function ContactLineRow({ line, update, remove }: ContactLineRowProps) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            as="div"
            value={line}
            dragListener={false}
            dragControls={dragControls}
            data-contact-row
            className="flex items-center gap-1.5 rounded-lg border bg-white p-1.5"
        >
            <button
                type="button"
                aria-label="Drag to reorder"
                onPointerDown={(event) => dragControls.start(event)}
                className="cursor-grab touch-none rounded p-1 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
            >
                <GripVerticalIcon className="size-4" />
            </button>

            <span
                title={CONTACT_LINE_KIND_META[line.kind].label}
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400"
            >
                <ContactLineIcon kind={line.kind} className="size-3.5" />
            </span>

            {line.kind === "custom" && (
                <Input
                    value={line.label}
                    onChange={(event) => update(line.id, { label: event.target.value })}
                    placeholder="Label"
                    className="max-w-[30%]"
                />
            )}
            <LineValueField line={line} update={update} />

            <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove line" onClick={() => remove(line.id)}>
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
                    <Button key={kind} type="button" variant="outline" size="sm" onClick={() => onAdd(kind)}>
                        <PlusIcon className="size-3.5" />
                        {CONTACT_LINE_KIND_META[kind].label}
                    </Button>
                ))}
            </div>
        </>
    );
}
