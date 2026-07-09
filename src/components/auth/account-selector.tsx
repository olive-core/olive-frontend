import { ChevronRightIcon, ClipboardListIcon, StethoscopeIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Accounts, ActiveView } from "@/types/auth";

interface AccountSelectorProps {
    accounts: Accounts;
    onSelect: (view: ActiveView, patientId?: string) => void;
    busy?: boolean;
}

interface AccountCard {
    key: string;
    view: ActiveView;
    patientId?: string;
    title: string;
    // A short type keyword (Doctor / Attendant / Patient) so every card is identifiable
    // at a glance while the title carries the person's name.
    chip: string;
    icon: typeof UserIcon;
    className: string;
    iconClassName: string;
    chipClassName: string;
}

function buildCards(accounts: Accounts): AccountCard[] {
    const cards: AccountCard[] = [];

    if (accounts.isClinician) {
        cards.push({
            key: "doctor",
            view: "doctor",
            title: accounts.clinicianName || "Doctor",
            chip: "Doctor",
            icon: StethoscopeIcon,
            className: "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
            iconClassName: "text-slate-600",
            chipClassName: "bg-slate-100 text-slate-700",
        });
    }

    if (accounts.isAttendant) {
        cards.push({
            key: "attendant",
            view: "attendant",
            title: accounts.attendantName || "Attendant",
            chip: "Attendant",
            icon: ClipboardListIcon,
            className: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
            iconClassName: "text-amber-600",
            chipClassName: "bg-amber-50 text-amber-700",
        });
    }

    for (const patient of accounts.patients) {
        const name = `${patient.firstName} ${patient.lastName ?? ""}`.trim();
        cards.push({
            key: `patient-${patient.patientId}`,
            view: "patient",
            patientId: patient.patientId,
            title: name || "Patient",
            chip: "Patient",
            icon: UserIcon,
            className: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
            iconClassName: "text-emerald-600",
            chipClassName: "bg-emerald-50 text-emerald-700",
        });
    }

    return cards;
}

// Shown when a phone already has accounts. Each card is a distinct identity to log
// into, so the person understands why they're verifying and where they'll land.
export default function AccountSelector({ accounts, onSelect, busy }: AccountSelectorProps) {
    const cards = buildCards(accounts);

    return (
        <div className="flex flex-col gap-3 w-full">
            <p className="text-sm text-slate-500 text-center">Choose an account to log in</p>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 -mr-1">
                {cards.map((card) => (
                    <button
                        key={card.key}
                        type="button"
                        disabled={busy}
                        onClick={() => onSelect(card.view, card.patientId)}
                        className={cn(
                            "flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 bg-white transition-colors text-left cursor-pointer disabled:opacity-60 disabled:pointer-events-none",
                            card.className,
                        )}
                    >
                        <card.icon className={cn("size-5 shrink-0", card.iconClassName)} />
                        <span className="flex-1 min-w-0 text-base font-medium text-slate-800 truncate">{card.title}</span>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", card.chipClassName)}>
                            {card.chip}
                        </span>
                        <ChevronRightIcon className="size-4 shrink-0 text-slate-400" />
                    </button>
                ))}
            </div>
        </div>
    );
}
