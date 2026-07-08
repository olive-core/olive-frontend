import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";

import { listChambers } from "@/lib/attendant-queue";

// Remembers which chamber each clinician last wrote a prescription at, so walk-in
// consultations default to it without any clicking. Queue-started sessions don't
// need this — their chamber is set server-side from the queue entry.
interface ActiveChamberStore {
    lastChamberByClinician: Record<string, string | null>;
    setLastChamber: (clinicianId: string, chamberId: string | null) => void;
}

export const useActiveChamberStore = create<ActiveChamberStore>()(
    persist(
        (set) => ({
            lastChamberByClinician: {},
            setLastChamber: (clinicianId, chamberId) =>
                set((state) => ({
                    lastChamberByClinician: { ...state.lastChamberByClinician, [clinicianId]: chamberId },
                })),
        }),
        { name: "olive:last-chamber" },
    ),
);

export function useLastChamberId(clinicianId?: string): string | null {
    return useActiveChamberStore((state) =>
        clinicianId ? (state.lastChamberByClinician[clinicianId] ?? null) : null,
    );
}

// A walk-in with no remembered chamber falls back to the doctor's only chamber (rather
// than none), so single-chamber doctors always see their pad without ever touching the
// switcher. Doctors with more than one chamber still need an explicit pick.
export function useDefaultChamberId(clinicianId?: string): string | null {
    const lastChamberId = useLastChamberId(clinicianId);
    const { data: chambers } = useQuery({
        queryKey: ["chambers"],
        queryFn:  listChambers,
        enabled:  !!clinicianId && lastChamberId === null,
    });
    if (lastChamberId !== null) return lastChamberId;
    return chambers?.length === 1 ? chambers[0].chamber_id : null;
}
