import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useComposeLetterhead } from "@/hooks/use-compose-letterhead";
import { ResolvedPrescriptionHeader } from "./header/clinician-prescription-header";

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

    return (
        <div className="flex w-full flex-col gap-2">
            <ResolvedPrescriptionHeader letterhead={letterhead} />
        </div>
    )
}
