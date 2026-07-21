import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../ui/input";

// How many results to render per scroll page. All matches stay reachable by
// scrolling; only this many are mounted at a time.
const RESULT_PAGE_SIZE = 50;

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
    trade_name?: string;
    generic_name?: string;
    dosage_form?: string;
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
    const [visibleCount, setVisibleCount] = useState(RESULT_PAGE_SIZE);

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

    // Reset highlight and the visible window whenever the result set changes
    useEffect(() => {
        setHighlightIndex(-1);
        setVisibleCount(RESULT_PAGE_SIZE);
    }, [options]);

    // Grow the rendered slice as the user scrolls near the bottom, so every match
    // is reachable while the DOM stays light.
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 40 && visibleCount < options.length) {
            setVisibleCount(prev => prev + RESULT_PAGE_SIZE);
        }
    };

    const visibleOptions = options.slice(0, visibleCount);

    const handleSelect = (option: Option) => {
        onChange(option);
        setInputValue(option.label);
        setIsOpen(false);
    };

    const handleAdd = () => {

        if (inputValue?.length === 0) return;

        handleSelect({
            label: inputValue,
            value: inputValue,
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) => {
                const next = Math.min(prev + 1, options.length - 1);
                if (next >= visibleCount) setVisibleCount(visibleCount + RESULT_PAGE_SIZE);
                return next;
            });
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => Math.max(prev - 1, 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0) {
                handleSelect(options[highlightIndex]);
            } else if (inputValue.length > 0) {
                handleAdd();
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
                <div
                    onScroll={handleScroll}
                    // Roughly ten results, since picking a brand means scanning several at once.
                    // The vh cap matters because this list only ever opens downwards: on a short
                    // viewport, or with the input low on screen, a fixed height would run off the page.
                    className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[min(22rem,60vh)] overflow-auto"
                >


                    {inputValue?.length > 0 && (
                        <div
                            onMouseDown={() => handleAdd()}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 italic text-blue-600`}
                        >
                            Add "{inputValue}"
                        </div>
                    )}

                    {isFetching && (
                        <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>
                    )}

                    {!isFetching && options.length === 0 && debouncedQuery.length >= minLength && (
                        <div className="px-3 py-2 text-xs text-gray-500">No results</div>
                    )}

                    {visibleOptions.map((option, index) => (
                        <div
                            key={index}
                            onMouseDown={() => handleSelect(option)}
                            className={`px-3 py-2 text-sm cursor-pointer ${index === highlightIndex
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            {option.trade_name ? (
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="font-bold">{option.trade_name}</span>
                                        {option.generic_name && <span className="text-gray-500 text-xs ml-1">({option.generic_name})</span>}
                                    </div>
                                    {option.dosage_form && (
                                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            {option.dosage_form}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                option.label
                            )}
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
