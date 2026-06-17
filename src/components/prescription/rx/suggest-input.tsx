import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import type { RxOption } from "@/constants/prescription";

interface SuggestInputProps {
    value: string;
    onChange: (value: string) => void;
    options: readonly RxOption[];
    placeholder?: string;
    className?: string;
    // When false, the doctor can only pick from the list (used where free text makes no sense).
    allowFreeText?: boolean;
}

// A lightweight typeahead over a static option list: filters as the doctor types, shows
// "code — full form", supports arrow/enter selection, and (by default) keeps free text.
// This is the primitive that lets the doctor type minimally for route / unit / site / etc.
export default function SuggestInput({
    value,
    onChange,
    options,
    placeholder = "Type or pick...",
    className,
    allowFreeText = true,
}: SuggestInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const query = value.trim().toLowerCase();
    const filtered = query
        ? options.filter(
              option =>
                  option.code.toLowerCase().includes(query) ||
                  option.fullForm.toLowerCase().includes(query),
          )
        : options;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => setHighlightIndex(-1), [value]);

    const select = (option: RxOption) => {
        onChange(option.code);
        setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightIndex(prev => Math.max(prev - 1, 0));
        } else if (event.key === "Enter") {
            if (highlightIndex >= 0 && filtered[highlightIndex]) {
                event.preventDefault();
                select(filtered[highlightIndex]);
            } else if (!allowFreeText) {
                event.preventDefault();
            }
        } else if (event.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <Input
                value={value}
                onChange={event => {
                    if (allowFreeText) onChange(event.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                readOnly={!allowFreeText}
                className={cn("h-10 text-base sm:text-sm", className)}
            />

            {isOpen && filtered.length > 0 && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                    {filtered.map((option, index) => (
                        <div
                            key={option.code}
                            onMouseDown={() => select(option)}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer flex items-baseline gap-2",
                                index === highlightIndex ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-100 text-gray-700",
                            )}
                        >
                            <span className="font-semibold">{option.code}</span>
                            {option.fullForm.toLowerCase() !== option.code.toLowerCase() && (
                                <span className="text-gray-400 text-xs">{option.fullForm}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
