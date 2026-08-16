import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useComposeLetterhead } from "@/hooks/use-compose-letterhead";
import { getPageSize, isPrePrinted, type PrintPaper } from "@/lib/print-paper";
import { ResolvedPrescriptionHeader } from "./header/clinician-prescription-header";

// This chamber prints on the doctor's own stationery, so the letterhead above is context
// for the screen only. Saying so here is cheaper than the surprise at the printer.
function PrePrintedPadNotice({ paper }: { paper: PrintPaper }) {
    return (
        <p className="rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
            Pre-printed pad ({getPageSize(paper.pageSize).label}). This header will not print.
        </p>
    );
}

// The resolved letterhead for an active session. The chamber is picked automatically
// (queue start / last-used chamber), so there is no selector here. Always a full-width
// column on its own — never a flex-row sibling of other controls — so the preset's
// internal layout gets the paper's true width to lay out against.
export default function DoctorInfo({ sessionId }: { sessionId: string }) {
    const { storeClinicianInfo } = useAuthStore();
    const { letterhead, clinician, isLoading } = useComposeLetterhead(sessionId);

    useEffect(() => {
        storeClinicianInfo({
            name: clinician?.name ?? "",
            bmdcNo: clinician?.bmdc_no ?? "",
            qualification: clinician?.qualification ?? "",
            generate_ai_draft: clinician?.generate_ai_draft ?? true
        })
    }, [clinician])

    if (isLoading || !clinician || !letterhead) return null;

    // `responsive`: a phone gets the identity-first header with the chamber block behind a
    // disclosure. The full letterhead lays the doctor and the chamber side by side, which at
    // phone width squeezes them into each other. Print has its own DOM and is unaffected.
    return (
        <div className="flex w-full flex-col gap-2">
            <ResolvedPrescriptionHeader letterhead={letterhead} responsive />
            {isPrePrinted(letterhead.paper) && <PrePrintedPadNotice paper={letterhead.paper} />}
        </div>
    )
}
