import type { ReactNode } from "react";

interface InsightCardProps {
    /** What this card shows. Never the rail's own wording — the rail already said that. */
    title:    string;
    /** The finding, in a sentence. The most-read line on the card, so it is set to be read. */
    lead?:    ReactNode;
    /** How a doctor would phrase the question out loud. An aside, not a heading. */
    example?: string;
    action?:  ReactNode;
    note?:    ReactNode;
    children: ReactNode;
}

export default function InsightCard({ title, lead, example, action, note, children }: InsightCardProps) {
    return (
        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
            <header className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-xs font-semibold uppercase tracking-wide text-emerald-700">{title}</h2>
                    {action}
                </div>
                {lead && <p className="text-base leading-snug text-slate-700">{lead}</p>}
                {example && (
                    <p className="text-[11px] italic text-slate-500" title={example}>&ldquo;{example}&rdquo;</p>
                )}
            </header>

            <div className="mt-6">{children}</div>

            {note && (
                <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">{note}</p>
            )}
        </section>
    );
}
