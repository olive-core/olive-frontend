import { Input } from "../../ui/input";

interface InstructionsInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions?: readonly string[];
}

// Free-text instructions with one-tap chips for the sig phrases common to a medicine type,
// so the doctor rarely has to type a full instruction.
export default function InstructionsInput({ value, onChange, suggestions = [] }: InstructionsInputProps) {
    const addPhrase = (phrase: string) => {
        if (!value.trim()) return onChange(phrase);
        if (value.toLowerCase().includes(phrase.toLowerCase())) return;
        onChange(`${value.trim()}. ${phrase}`);
    };

    return (
        <div className="space-y-1.5">
            <Input
                value={value}
                onChange={event => onChange(event.target.value)}
                placeholder="e.g. If pain persists, complete the course..."
                className="h-10 text-base sm:text-sm"
            />
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {suggestions.map(phrase => (
                        <button
                            key={phrase}
                            type="button"
                            onClick={() => addPhrase(phrase)}
                            className="px-2 py-0.5 text-[11px] rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                            + {phrase}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
