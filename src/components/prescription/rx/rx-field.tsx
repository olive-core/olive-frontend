import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RxFieldProps {
    label: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}

// Consistent labelled-field wrapper shared by every archetype form, so they all line up.
export default function RxField({ label, icon, children, className }: RxFieldProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-1.5 ml-1 text-slate-500">
                {icon}
                <label className="text-[11px] font-semibold uppercase tracking-tight">{label}</label>
            </div>
            {children}
        </div>
    );
}
