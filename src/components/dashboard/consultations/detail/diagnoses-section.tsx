import { MicroscopeIcon } from "lucide-react";
import Section from "./section";
import type { DiagnosisItem } from "@/types/patient";

interface DiagnosesSectionProps {
    diagnoses: DiagnosisItem[];
}

export default function DiagnosesSection({ diagnoses }: DiagnosesSectionProps) {
    if (diagnoses.length === 0) return null;

    return (
        <Section icon={<MicroscopeIcon className="size-4" />} title="Diagnoses">
            <ul className="list-disc list-inside space-y-1">
                {diagnoses.map((diagnosis, index) => (
                    <li key={index} className="text-sm text-slate-600">
                        {diagnosis.name_text}
                    </li>
                ))}
            </ul>
        </Section>
    );
}
