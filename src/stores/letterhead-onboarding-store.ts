import { create } from "zustand";
import { persist } from "zustand/middleware";

// Remembers whether the doctor has already answered the "set up your prescription pad"
// invitation, so a doctor who skips it is never shown it again. Persisted because the
// session outlives a page reload — doctors stay logged in until they log out.
interface LetterheadOnboardingStore {
    dismissed: boolean;
    dismiss: () => void;
}

export const useLetterheadOnboarding = create<LetterheadOnboardingStore>()(
    persist(
        (set) => ({
            dismissed: false,
            dismiss: () => set({ dismissed: true }),
        }),
        { name: "letterhead-onboarding" },
    ),
);
