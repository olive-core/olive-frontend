import { DEFAULT_HEADER_CONFIG, type ResolvedLetterhead } from "@/lib/header-config";
import { DEFAULT_PRINT_PAPER } from "@/lib/print-paper";

// A doctor who has filled in both halves of the letterhead — the case where the phone
// header has something to collapse.
export const letterhead: ResolvedLetterhead = {
    identity: { name: "Dr. Rafiqul Islam", qualification: "MBBS, FCPS (Medicine)", bmdcNo: "A-12345" },
    config: {
        ...DEFAULT_HEADER_CONFIG,
        chamberName:  "Popular Diagnostic Centre",
        contactLines: [
            { id: "a", kind: "address", label: "Address", value: "House 12, Road 5, Dhanmondi, Dhaka" },
            { id: "p", kind: "phone",   label: "Phone",   value: "01711-000000" },
        ],
    },
    footer: { chambers: [] },
    paper:  DEFAULT_PRINT_PAPER,
};

export function useComposeLetterhead() {
    return { letterhead, clinician: { name: "Dr. Rafiqul Islam" }, isLoading: false };
}
