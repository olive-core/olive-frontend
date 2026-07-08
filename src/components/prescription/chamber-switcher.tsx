import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckIcon, ChevronDownIcon } from "lucide-react";

import api from "@/lib/axios";
import { cn, handleError } from "@/lib/utils";
import { padDisplayName } from "@/lib/chamber-pad";
import { chamberRoom, type Chamber } from "@/types/attendant-queue";
import { useActiveChamberStore } from "@/stores/active-chamber-store";
import { useAuthStore } from "@/stores/auth-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChamberSwitcherProps {
    sessionId:       string;
    chambers:        Chamber[];
    activeChamberId: string | null;
}

// A compact chip showing which pad this prescription will print on. Queue-started
// sessions arrive with the right chamber already set; this is the one-tap escape
// hatch for walk-ins and mistakes. Hidden in print and for single-pad doctors.
export default function ChamberSwitcher({ sessionId, chambers, activeChamberId }: ChamberSwitcherProps) {
    const queryClient = useQueryClient();
    const { userId } = useAuthStore();
    const setLastChamber = useActiveChamberStore((state) => state.setLastChamber);

    const switchMutation = useMutation({
        mutationFn: (chamberId: string | null) =>
            api.put(`/session/${sessionId}`, { chamber_id: chamberId }),
        onSuccess: (_, chamberId) => {
            queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
            if (userId) setLastChamber(userId, chamberId);
        },
        onError: (error) => handleError(error, "Could not switch chamber"),
    });

    if (chambers.length === 0) return null;

    const activeChamber = chambers.find((chamber) => chamber.chamber_id === activeChamberId) ?? null;
    const activeLabel = activeChamber ? padDisplayName(activeChamber) : "No chamber";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600",
                    "hover:bg-slate-100 print:hidden",
                    switchMutation.isPending && "opacity-60",
                )}
                aria-label={`Prescription pad: ${activeLabel}. Change chamber`}
            >
                <Building2 className="size-3.5 text-slate-400" aria-hidden />
                <span className="max-w-[180px] truncate">{activeLabel}</span>
                <ChevronDownIcon className="size-3.5 text-slate-400" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {chambers.map((chamber) => {
                    const room = chamberRoom(chamber);
                    const isActive = chamber.chamber_id === activeChamberId;
                    return (
                        <DropdownMenuItem
                            key={chamber.chamber_id}
                            onSelect={() => !isActive && switchMutation.mutate(chamber.chamber_id)}
                        >
                            <span className="flex-1 truncate">
                                {padDisplayName(chamber)}
                                {room ? ` · ${room}` : ""}
                            </span>
                            {isActive && <CheckIcon className="size-4 text-emerald-600" aria-hidden />}
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuItem onSelect={() => activeChamberId !== null && switchMutation.mutate(null)}>
                    <span className="flex-1">No chamber</span>
                    {activeChamberId === null && <CheckIcon className="size-4 text-emerald-600" aria-hidden />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
