import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PrescriptionSearchProps {
    value:    string;
    onChange: (value: string) => void;
}

export default function PrescriptionSearch({ value, onChange }: PrescriptionSearchProps) {
    return (
        <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
                type="search"
                placeholder="Search by doctor or diagnosis"
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
