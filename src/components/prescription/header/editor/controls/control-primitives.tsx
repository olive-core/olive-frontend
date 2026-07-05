import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Shared building blocks that give the header editor's control panel a consistent look.

export function ControlSection({ title, description, children }: {
    title:        string;
    description?:  string;
    children:     ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4 rounded-xl border bg-white p-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
            </div>
            {children}
        </section>
    );
}

export function LabeledInput({ label, value, onChange, placeholder }: {
    label:        string;
    value:        string;
    onChange:     (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        </label>
    );
}

export function ToggleRow({ label, description, checked, onChange }: {
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
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={cn(
                    "flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition",
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
        <div className="inline-flex rounded-lg border bg-slate-50 p-0.5">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        value === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
