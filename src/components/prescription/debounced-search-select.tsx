import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../ui/input";

// -----------------------------
// Hook: Debounce
// -----------------------------
function useDebounce<T>(value: T, delay: number = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// -----------------------------
// Types
// -----------------------------
export type Option = {
    label: string;
    value: string;
};

interface Props {
    value: Option | null;
    onChange: (option: Option | null) => void;
    fetchOptions: (query: string) => Promise<Option[]>;
    placeholder?: string;
    debounceTime?: number;
    minLength?: number;
    queryKeyBase: string | unknown[]
}

// -----------------------------
// Component
// -----------------------------
export default function DebouncedSearchSelect({
    value,
    onChange,
    fetchOptions,
    placeholder = "Search...",
    debounceTime = 400,
    minLength = 2,
    queryKeyBase,
}: Props) {
    const [inputValue, setInputValue] = useState(value?.label || "");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(inputValue, debounceTime);

    const { data: options = [], isFetching } = useQuery({
        queryKey: [...queryKeyBase, debouncedQuery],
        queryFn: () => fetchOptions(debouncedQuery),
        enabled: debouncedQuery.length >= minLength,
        staleTime: 1000 * 60,
    });

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset highlight when options change
    useEffect(() => {
        setHighlightIndex(-1);
    }, [options]);

    const handleSelect = (option: Option) => {
        onChange(option);
        setInputValue(option.label);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) => Math.min(prev + 1, options.length - 1));
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => Math.max(prev - 1, 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0) {
                handleSelect(options[highlightIndex]);
            }
        }

        if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <Input
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {isFetching && (
                        <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>
                    )}

                    {!isFetching && options.length === 0 && debouncedQuery.length >= minLength && (
                        <div className="px-3 py-2 text-xs text-gray-500">No results</div>
                    )}

                    {options.map((option, index) => (
                        <div
                            key={option.value}
                            onMouseDown={() => handleSelect(option)}
                            className={`px-3 py-2 text-sm cursor-pointer ${index === highlightIndex
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// -----------------------------
// Usage Example
// -----------------------------
/*
const fetchUsers = async (query: string): Promise<Option[]> => {
  const res = await fetch(`/api/users?q=${query}`);
  const data = await res.json();
  return data.map((u: any) => ({ label: u.name, value: u.id }));
};

<DebouncedSearchSelect
  value={selectedUser}
  onChange={setSelectedUser}
  fetchOptions={fetchUsers}
  queryKeyBase={"user-search"}
/>
*/
