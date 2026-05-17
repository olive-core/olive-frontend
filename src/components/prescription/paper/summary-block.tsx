import { useState } from "react";

interface SummaryBlockProps {
    summary?: string | null;
    onChange?: (value: string) => void;
}

export default function SummaryBlock({ summary, onChange }: SummaryBlockProps) {
    const isEditable = onChange !== undefined;
    const [isEditing, setIsEditing] = useState(false);

    if (!isEditable && (!summary || !summary.trim())) return null;

    return (
        <div className="flex flex-col gap-2 p-2 rounded-xl px-4 print:hidden">
            <div className="flex items-center px-1">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">
                    Summary
                </h3>
            </div>

            {isEditing ? (
                <textarea
                    autoFocus
                    className="w-full rounded-lg border border-emerald-500 bg-white px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[72px] shadow-lg"
                    value={summary ?? ""}
                    placeholder="Add a clinical summary..."
                    onChange={(e) => onChange!(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                />
            ) : (
                <div
                    className={`rounded-lg border border-border bg-muted py-1 px-2 text-sm whitespace-pre-wrap ${
                        isEditable ? "cursor-pointer hover:bg-accent" : ""
                    }`}
                    onClick={isEditable ? () => setIsEditing(true) : undefined}
                >
                    {summary?.trim()
                        ? summary
                        : <span className="text-slate-400 italic text-xs">Click to add a summary...</span>
                    }
                </div>
            )}
        </div>
    );
}
