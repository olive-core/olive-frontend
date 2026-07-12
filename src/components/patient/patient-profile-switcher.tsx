import { CheckIcon, ChevronDownIcon, UserIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";

const displayName = (name?: string) => (name ?? "").trim();

// One phone can reach several patients, so the patient area needs a way to switch
// between them. Hidden when there's only one profile — nothing to switch to.
export default function PatientProfileSwitcher() {
    const patients = useAuthStore((s) => s.accounts.patients);
    const activePatientId = useAuthStore((s) => s.activePatientId);
    const setActivePatientId = useAuthStore((s) => s.setActivePatientId);

    if (patients.length <= 1) return null;

    const active = patients.find((p) => p.patientId === activePatientId) ?? patients[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex max-w-[60vw] cursor-pointer items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:max-w-[16rem]">
                <UserIcon className="size-4 shrink-0 text-emerald-600" />
                <span className="min-w-0 flex-1 truncate">{displayName(active.name)}</span>
                <ChevronDownIcon className="size-4 shrink-0 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuLabel>Switch profile</DropdownMenuLabel>
                {patients.map((patient) => (
                    <DropdownMenuItem
                        key={patient.patientId}
                        onSelect={() => setActivePatientId(patient.patientId)}
                        className="flex cursor-pointer items-center justify-between gap-3"
                    >
                        <span className="truncate">{displayName(patient.name)}</span>
                        {patient.patientId === active.patientId && <CheckIcon className="size-4 text-emerald-600" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
