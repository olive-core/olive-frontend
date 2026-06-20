import { create } from "zustand";

import type { SubscriptionStatus } from "@/types/subscription";

interface SubscriptionGateState {
    blocked: SubscriptionStatus | null;
    show: (status: SubscriptionStatus | null) => void;
    clear: () => void;
}

export const useSubscriptionGate = create<SubscriptionGateState>((set) => ({
    blocked: null,
    show: (status) => set({ blocked: status }),
    clear: () => set({ blocked: null }),
}));
