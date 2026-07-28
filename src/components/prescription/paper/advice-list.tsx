interface AdviceListProps {
    items: string[];
}

export default function AdviceList({ items }: AdviceListProps) {
    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 p-3 border rounded-xl bg-white">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900">Advice</h3>
            </div>

            <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 border rounded-lg p-2 bg-slate-50">
                        <span className="text-slate-900 mt-1">•</span>
                        <p className="text-sm text-slate-800 flex-1">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
