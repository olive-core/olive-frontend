import { LockIcon, ShieldAlertIcon } from "lucide-react";

interface ClinicalNotesPanelProps {
    notes?:     string | null;
    safetyNet?: string[];
    onChange?:  (value: string) => void;
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

export default function ClinicalNotesPanel({ notes, safetyNet, onChange }: ClinicalNotesPanelProps) {
    const isEditable = onChange !== undefined;

    return (
        <div className="flex flex-col gap-3 p-4">
            <SafetyNetCallout items={safetyNet ?? []} />

            <div className="flex items-center gap-2">
                <LockIcon className="size-4 text-slate-400" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">
                    Clinical Notes
                </h3>
            </div>

            <p className="text-xs text-slate-400">
                Private &middot; only you can see this. Not shared with the patient and not printed.
            </p>

            {isEditable ? (
                <textarea
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed resize-y min-h-[280px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={notes ?? ""}
                    placeholder="Add your clinical notes..."
                    onChange={(e) => onChange!(e.target.value)}
                />
            ) : (
                <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[280px]">
                    {notes?.trim()
                        ? notes
                        : <span className="text-slate-400 italic">No clinical notes.</span>
                    }
                </div>
            )}
        </div>
    );
}
