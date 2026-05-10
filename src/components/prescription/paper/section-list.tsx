import SectionItem, { type SectionItemProps } from "./section-item";

interface SectionListProps {
    title:          string;
    items:          SectionItemProps[];
    isHighlighted?: boolean;
}

function getContainerClass(isHighlighted: boolean): string {
    return isHighlighted
        ? "flex flex-col gap-2 p-2 rounded-xl bg-emerald-50/40 border-2 border-emerald-500 pl-3"
        : "flex flex-col gap-2 p-2 rounded-xl";
}

function getTitleClass(isHighlighted: boolean): string {
    return isHighlighted
        ? "font-bold text-xs uppercase tracking-widest text-emerald-700"
        : "font-bold text-xs uppercase tracking-widest text-slate-500";
}

function getItemClass(isHighlighted: boolean): string {
    return isHighlighted
        ? "rounded-lg border py-1 px-2 bg-white/80 border-emerald-100"
        : "rounded-lg border py-1 px-2 bg-muted border-border";
}

export default function SectionList({ title, items, isHighlighted = false }: SectionListProps) {
    if (items.length === 0) return null;

    return (
        <div className={getContainerClass(isHighlighted)}>
            <div className="flex items-center px-1">
                <h3 className={getTitleClass(isHighlighted)}>{title}</h3>
            </div>

            <div className="flex flex-col gap-1.5">
                {items.map((item, index) => (
                    <div key={index} className={getItemClass(isHighlighted)}>
                        <SectionItem {...item} />
                    </div>
                ))}
            </div>
        </div>
    );
}
