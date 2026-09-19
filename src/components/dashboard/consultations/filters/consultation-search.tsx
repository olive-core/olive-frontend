import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const INPUT_ID = "consultation-search";

interface ConsultationSearchProps {
    value:    string;
    onChange: (value: string) => void;
}

/** One box for the three things a doctor remembers a visit by: who it was, what was
 *  wrong, and the number on the slip. It stays a single plain field, so the page at rest
 *  is the page it has always been and only its reach is wider. */
export default function ConsultationSearch({ value, onChange }: ConsultationSearchProps) {
    return (
        <div role="search" className="relative w-full sm:w-80">
            <label htmlFor={INPUT_ID} className="sr-only">
                Search consultations by patient name, diagnosis or phone number
            </label>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
                id={INPUT_ID}
                type="search"
                autoComplete="off"
                placeholder="Name, diagnosis or number"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    // Escape clears everywhere, not only in the browsers that do it for free.
                    if (event.key === "Escape" && value) {
                        event.preventDefault();
                        onChange("");
                    }
                }}
                className="pl-9 pr-11 h-11 sm:h-9"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                >
                    <XIcon className="size-4" />
                </button>
            )}
        </div>
    );
}
