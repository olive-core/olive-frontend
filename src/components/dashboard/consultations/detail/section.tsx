import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface SectionProps {
    icon:     ReactNode;
    title:    string;
    children: ReactNode;
}

export default function Section({ icon, title, children }: SectionProps) {
    return (
        <>
            <div className="space-y-3">
                <h3 className="font-medium text-sm flex items-center gap-2 text-slate-700">
                    <span className="text-emerald-500">{icon}</span>
                    {title}
                </h3>
                {children}
            </div>
            <Separator />
        </>
    );
}
