import ClinicianHeader from "../paper/clinician-header";
import PrescriptionHeader from "./prescription-header";
import {
    hasHeaderContent,
    headerConfigFromApi,
    type DoctorIdentity,
    type HeaderConfigApi,
} from "@/lib/header-config";

interface ClinicianPrescriptionHeaderProps extends DoctorIdentity {
    headerConfig?: HeaderConfigApi | null;
}

// The drop-in header for the real prescription views. Renders the customized letterhead when
// the doctor has set one up; otherwise falls back to the plain name/qualification/BMDC header
// so existing prescriptions and un-customized doctors look exactly as before.
export default function ClinicianPrescriptionHeader({
    firstName,
    lastName,
    qualification,
    bmdcNo,
    headerConfig,
}: ClinicianPrescriptionHeaderProps) {
    const config = headerConfigFromApi(headerConfig);

    if (!hasHeaderContent(config)) {
        return (
            <ClinicianHeader
                firstName={firstName}
                lastName={lastName}
                qualification={qualification}
                bmdcNo={bmdcNo}
            />
        );
    }

    return <PrescriptionHeader identity={{ firstName, lastName, qualification, bmdcNo }} config={config} />;
}
