import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useComposeLetterhead } from "@/hooks/use-compose-letterhead";
import { ResolvedPrescriptionHeader } from "./header/clinician-prescription-header";
import ChamberSwitcher from "./chamber-switcher";

// The letterhead for an active session: chamber switcher (when the doctor has more than
// one chamber) plus the resolved header. Always a full-width column on its own — never a
// flex-row sibling of other controls — so the preset's internal layout gets the paper's
// true width to lay out against (see PrescriptionActions for the session's other controls).
export default function DoctorInfo({ sessionId }: { sessionId: string }) {
    const { storeClinicianInfo } = useAuthStore();
    const { letterhead, clinician, chambers, activeChamberId, isLoading } = useComposeLetterhead(sessionId);

    useEffect(() => {
        storeClinicianInfo({
            firstName: clinician?.first_name ?? "",
            lastName: clinician?.last_name ?? "",
            bmdcNo: clinician?.bmdc_no ?? "",
            qualification: clinician?.qualification ?? "",
            generate_ai_draft: clinician?.generate_ai_draft ?? true
        })
    }, [clinician])

    if (isLoading || !clinician || !letterhead) return null;

    return (
        <div className="flex w-full flex-col gap-2">
            {chambers.length > 0 && (
                <ChamberSwitcher
                    sessionId={sessionId}
                    chambers={chambers}
                    activeChamberId={activeChamberId}
                />
            )}
            <ResolvedPrescriptionHeader letterhead={letterhead} />
        </div>
    )
}
