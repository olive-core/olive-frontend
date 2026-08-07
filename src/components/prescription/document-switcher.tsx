import type { ReactNode } from "react";
import { PillIcon, ClipboardListIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export type PrescriptionDocument = "prescription" | "notes";

interface DocumentSwitcherProps {
    value:            PrescriptionDocument;
    onValueChange:    (value: PrescriptionDocument) => void;
    prescription:     ReactNode;
    notes:            ReactNode;
    notesHasContent?: boolean;
    /** Session controls (Generate Draft, Apply memory) pinned right under the tab bar. */
    actions?:         ReactNode;
}

interface SegmentLabelProps {
    icon:      ReactNode;
    title:     string;
    subtitle:  string;
    showBadge?: boolean;
}

function SegmentLabel({ icon, title, subtitle, showBadge }: SegmentLabelProps) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1.5 font-semibold">
                {icon}
                {title}
                {showBadge && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </span>
            <span className="text-[11px] font-normal text-slate-400">{subtitle}</span>
        </div>
    );
}

export default function DocumentSwitcher({
    value,
    onValueChange,
    prescription,
    notes,
    notesHasContent,
    actions,
}: DocumentSwitcherProps) {
    return (
        <Tabs
            value={value}
            onValueChange={(next) => onValueChange(next as PrescriptionDocument)}
        >
            <TabsList className="mx-auto h-auto w-full max-w-md rounded-xl p-1.5 print:hidden">
                <TabsTrigger value="prescription" className="h-auto flex-1 rounded-lg py-2.5">
                    <SegmentLabel
                        icon={<PillIcon className="size-4" />}
                        title="Prescription"
                        subtitle="Given to patient"
                    />
                </TabsTrigger>
                <TabsTrigger value="notes" className="h-auto flex-1 rounded-lg py-2.5">
                    <SegmentLabel
                        icon={<ClipboardListIcon className="size-4" />}
                        title="Clinical Notes"
                        subtitle="Private · for you"
                        showBadge={notesHasContent}
                    />
                </TabsTrigger>
            </TabsList>

            {actions && <div className="container mt-3 flex justify-center print:hidden">{actions}</div>}

            <TabsContent value="prescription">{prescription}</TabsContent>
            <TabsContent value="notes">{notes}</TabsContent>
        </Tabs>
    );
}
