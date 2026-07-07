import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Shared building blocks that give the header editor's control panel a consistent look.

export function ControlSection({ title, description, icon: Icon, action, children }: {
    title:        string;
    description?:  string;
    icon?:        LucideIcon;
    action?:      ReactNode;
    children:     ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3.5 rounded-xl border bg-white p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Icon className="size-4" />
                        </span>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                        {description && <p className="text-xs text-slate-400">{description}</p>}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function LabeledInput({ id, label, value, onChange, placeholder }: {
    id?:          string;
    label:        string;
    value:        string;
    onChange:     (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
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
            <span className="flex items-baseline justify-between text-xs font-medium text-slate-500">
                {label}
                <span className="text-[10px] font-normal text-slate-300">Enter ↵ for a new line</span>
            </span>
            <textarea
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                        value === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
