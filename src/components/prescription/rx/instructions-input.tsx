import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../ui/input";
import RxChip from "./rx-chip";

interface InstructionsInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions?: readonly string[];
}

// Instructions are stored as one ". "-joined string (unchanged for the backend) but edited as a
// list of chips: quick-add from suggestions or a custom field, and remove any one with its X.
const splitInstructions = (text: string): string[] =>
    text.split(/\.\s+/).map(part => part.trim().replace(/\.$/, "")).filter(Boolean);
const joinInstructions = (items: string[]): string => items.join(". ");

export default function InstructionsInput({ value, onChange, suggestions = [] }: InstructionsInputProps) {
    const [custom, setCustom] = useState("");
    const items = splitInstructions(value);
    const has = (phrase: string) => items.some(item => item.toLowerCase() === phrase.trim().toLowerCase());

    const add = (phrase: string) => {
        const trimmed = phrase.trim();
        if (!trimmed || has(trimmed)) return;
        onChange(joinInstructions([...items, trimmed]));
    };
    const remove = (index: number) => onChange(joinInstructions(items.filter((_, i) => i !== index)));
    const addCustom = () => {
        add(custom);
        setCustom("");
    };

    const unusedSuggestions = suggestions.filter(phrase => !has(phrase));

    return (
        <div className="space-y-1.5">
            {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {items.map((item, index) => (
                        <span key={`${item}-${index}`} className="inline-flex items-center gap-1 pl-2 py-0.5 text-[11px] rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                            {item}
                            {/* Padding, not a bigger icon: the 12px cross reads right beside the
                                text but needs a finger-sized area around it to be tappable. */}
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label={`Remove ${item}`}
                                className="flex min-h-9 min-w-9 sm:min-h-0 sm:min-w-0 items-center justify-center px-1 text-emerald-500 hover:text-emerald-700 cursor-pointer"
                            >
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <Input
                value={custom}
                onChange={event => setCustom(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        addCustom();
                    }
                }}
                placeholder="Add a custom instruction, then press Enter"
                enterKeyHint="done"
                className="h-11 sm:h-10 text-base sm:text-sm"
            />

            {unusedSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {unusedSuggestions.map(phrase => (
                        <RxChip
                            key={phrase}
                            label={`+ ${phrase}`}
                            onClick={() => add(phrase)}
                            className="sm:px-2 sm:py-0.5 sm:text-[11px]"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
