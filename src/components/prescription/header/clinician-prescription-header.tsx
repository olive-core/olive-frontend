import ClinicianHeader from "../paper/clinician-header";
import MobilePrescriptionHeader from "./mobile-prescription-header";
import PrescriptionHeader from "./prescription-header";
import { hasHeaderContent, type ResolvedLetterhead } from "@/lib/header-config";

// The drop-in header for the real prescription views, fed by resolveLetterhead (or the
// compose screen's live resolution) so the chamber-resolved snapshot wins over the
// clinician's live config. Doctors who never customized a letterhead fall back to the
// plain name/qualification/BMDC header, exactly as before. With `responsive`, phones
// get the collapsible identity-first header instead of the full letterhead; print
// always renders the full letterhead (the print view has its own DOM).
export function ResolvedPrescriptionHeader({
    letterhead,
    responsive = false,
}: {
    letterhead:  ResolvedLetterhead;
    responsive?: boolean;
}) {
    const { identity, config } = letterhead;

    if (!hasHeaderContent(config)) {
        return (
            <ClinicianHeader
                firstName={identity.firstName}
                lastName={identity.lastName}
                qualification={identity.qualification}
                bmdcNo={identity.bmdcNo}
            />
        );
    }

    if (!responsive) {
        return <PrescriptionHeader identity={identity} config={config} />;
    }

    return (
        <>
            <div className="hidden sm:block print:block">
                <PrescriptionHeader identity={identity} config={config} />
            </div>
            <div className="sm:hidden print:hidden">
                <MobilePrescriptionHeader identity={identity} config={config} />
            </div>
        </>
    );
}
