const MAX_VISIBLE_DIAGNOSES = 2;

interface DiagnosisPillsProps {
    diagnoses: string[];
}

export default function DiagnosisPills({ diagnoses }: DiagnosisPillsProps) {

    if (diagnoses.length === 0) {
        return (
            <span className="text-xs text-slate-400 italic">
                No diagnosis recorded
            </span>
        );
    }

    const visible = diagnoses.slice(0, MAX_VISIBLE_DIAGNOSES);
    const overflow = diagnoses.length - visible.length;

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {visible.map((diagnosis, index) => (
                <span
                    key={index}
                    className="inline-block max-w-[160px] truncate px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
                    title={diagnosis}
                >
                    {diagnosis}
                </span>
            ))}
            {overflow > 0 && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                    +{overflow}
                </span>
            )}
        </div>
    );
}
