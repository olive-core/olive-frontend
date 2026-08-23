import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Shared building blocks that give the pad editor's sections a consistent look.

export function FieldGroup({ label, hint, children }: {
    label:    string;
    hint?:    string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-2.5">
            <div>
                <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
                {hint && <p className="text-xs text-slate-400">{hint}</p>}
            </div>
            {children}
        </section>
    );
}

export function LabeledInput({ id, label, value, onChange, placeholder, lang }: {
    id?:          string;
    label:        string;
    value:        string;
    onChange:     (value: string) => void;
    placeholder?: string;
    lang?:        string;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <Input id={id} lang={lang} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 sm:h-9" />
        </label>
    );
}

export function LabeledTextarea({ id, label, value, onChange, placeholder, rows = 2 }: {
    id?:          string;
    label:        string;
    value:        string;
    onChange:     (value: string) => void;
    placeholder?: string;
    rows?:        number;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs font-medium text-slate-500">
                {label}
                <span className="text-[10px] font-normal text-slate-300">Enter ↵ for a new line</span>
            </span>
            <textarea
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none [field-sizing:content] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            />
        </label>
    );
}

export function ToggleRow({ id, label, description, checked, onChange }: {
    id?:          string;
    label:        string;
    description?: string;
    checked:      boolean;
    onChange:     (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                {description && <p className="text-xs text-slate-400">{description}</p>}
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition",
                    // The visible track stays 24px; the tap area reaches 44 on a phone.
                    "before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] sm:before:content-none",
                    checked ? "bg-emerald-500" : "bg-slate-300",
                )}
            >
                <div className={cn("size-4 rounded-full bg-white shadow-md transition", checked ? "translate-x-5" : "translate-x-0")} />
            </button>
        </div>
    );
}

export function SegmentedControl<T extends string>({ value, options, onChange }: {
    value:    T;
    options:  { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <div className="inline-flex max-w-full flex-wrap rounded-lg border bg-slate-50 p-0.5">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "min-h-11 rounded-md px-3.5 text-xs font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1",
                        value === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
