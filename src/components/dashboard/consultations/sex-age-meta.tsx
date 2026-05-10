import { MarsIcon, TransgenderIcon, VenusIcon } from "lucide-react";
import type { PatientSex } from "@/types/consultation";
import { getAgeFromDOB } from "@/lib/utils";

interface SexAgeMetaProps {
    sex?:         PatientSex | null;
    dateOfBirth?: string | null;
}

function renderSexIcon(sex?: PatientSex | null) {
    switch (sex) {
        case "male":       return <MarsIcon       className="size-3.5 text-blue-500" />;
        case "female":     return <VenusIcon      className="size-3.5 text-pink-500" />;
        case "non_binary": return <TransgenderIcon className="size-3.5 text-purple-500" />;
        default:           return null;
    }
}

export default function SexAgeMeta({ sex, dateOfBirth }: SexAgeMetaProps) {
    const ageLabel = dateOfBirth ? `${getAgeFromDOB(dateOfBirth).years}y` : null;

    if (!sex && !ageLabel) return null;

    return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            {renderSexIcon(sex)}
            {ageLabel && <span>{ageLabel}</span>}
        </span>
    );
}
