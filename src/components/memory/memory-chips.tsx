import { memorySectionChips } from "@/lib/memory";

// Shows what a memory fills before it is applied — a full prescription memory and an
// advice-only one are told apart at a glance, without a confirmation step.
export default function MemoryChips({ sections }: { sections: string[] }) {
    const chips = memorySectionChips(sections);
    if (chips.length === 0) return null;

    return (
        <span className="flex flex-wrap gap-1">
            {chips.map((chip) => (
                <span
                    key={chip}
                    className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                >
                    {chip}
                </span>
            ))}
        </span>
    );
}
