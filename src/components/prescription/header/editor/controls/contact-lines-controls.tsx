import { Reorder, useDragControls } from "motion/react";
import { ContactIcon, GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";

import {
    CONTACT_LINE_KIND_META,
    CONTACT_LINE_KINDS,
    type ContactLine,
    type ContactLineKind,
} from "@/lib/header-config";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContactLineIcon from "../../parts/contact-line-icon";
import { controlId } from "../focus-field";
import { ControlSection, LabeledInput } from "./control-primitives";

function LineValueField({ line, update }: { line: ContactLine; update: (id: string, changes: Partial<ContactLine>) => void }) {
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
    update: (id: string, changes: Partial<ContactLine>) => void;
    remove: (id: string) => void;
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

export default function ContactLinesControls() {
    const chamberName = useHeaderConfigStore((state) => state.config.chamberName);
    const contactLines = useHeaderConfigStore((state) => state.config.contactLines);
    const patch = useHeaderConfigStore((state) => state.patch);
    const addContactLine = useHeaderConfigStore((state) => state.addContactLine);
    const updateContactLine = useHeaderConfigStore((state) => state.updateContactLine);
    const removeContactLine = useHeaderConfigStore((state) => state.removeContactLine);
    const reorderContactLines = useHeaderConfigStore((state) => state.reorderContactLines);

    return (
        <ControlSection
            title="Chamber & contact"
            description="Drag the handles to reorder. Add any line you need."
            icon={ContactIcon}
        >
            <LabeledInput
                id={controlId("chamberName")}
                label="Chamber / center name"
                value={chamberName}
                onChange={(value) => patch({ chamberName: value })}
                placeholder="Green Life Medical Center"
            />

            {contactLines.length > 0 && (
                <Reorder.Group as="div" axis="y" values={contactLines} onReorder={reorderContactLines} className="flex flex-col gap-1.5">
                    {contactLines.map((line) => (
                        <ContactLineRow key={line.id} line={line} update={updateContactLine} remove={removeContactLine} />
                    ))}
                </Reorder.Group>
            )}

            <div className="flex flex-wrap gap-1.5">
                {CONTACT_LINE_KINDS.map((kind: ContactLineKind) => (
                    <Button key={kind} type="button" variant="outline" size="sm" onClick={() => addContactLine(kind)}>
                        <PlusIcon className="size-3.5" />
                        {CONTACT_LINE_KIND_META[kind].label}
                    </Button>
                ))}
            </div>
        </ControlSection>
    );
}
