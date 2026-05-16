import { UserIcon, StethoscopeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
    onSelect: (role: 'patient' | 'clinician') => void;
}

const ROLES = [
    {
        value: 'patient' as const,
        label: "I'm a Patient",
        icon: UserIcon,
        className: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
        iconClassName: "text-emerald-600",
    },
    {
        value: 'clinician' as const,
        label: "I'm a Doctor",
        icon: StethoscopeIcon,
        className: "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
        iconClassName: "text-slate-600",
    },
];

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
    return (
        <div className="flex flex-col gap-3 w-full">
            <p className="text-sm text-slate-500 text-center">How would you like to register?</p>
            {ROLES.map((role) => (
                <button
                    key={role.value}
                    type="button"
                    onClick={() => onSelect(role.value)}
                    className={cn(
                        "flex items-center gap-4 w-full px-5 py-4 rounded-xl border-2 bg-white transition-colors text-left",
                        role.className,
                    )}
                >
                    <role.icon className={cn("size-6 shrink-0", role.iconClassName)} />
                    <span className="text-base font-medium text-slate-800">{role.label}</span>
                </button>
            ))}
        </div>
    );
}
