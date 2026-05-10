import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PatientSearchProps {
    value:    string;
    onChange: (value: string) => void;
}

export default function PatientSearch({ value, onChange }: PatientSearchProps) {
    return (
        <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
                type="search"
                placeholder="Search by patient name"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="pl-9 pr-9 h-9"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search"
                >
                    <XIcon className="size-4" />
                </button>
            )}
        </div>
    );
}
