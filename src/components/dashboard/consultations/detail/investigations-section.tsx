import { FlaskConicalIcon } from "lucide-react";
import Section from "./section";
import type { ConsultationInvestigationItem } from "@/types/consultation";

interface InvestigationsSectionProps {
    investigations: ConsultationInvestigationItem[];
}

export default function InvestigationsSection({ investigations }: InvestigationsSectionProps) {
    if (investigations.length === 0) return null;

    return (
        <Section icon={<FlaskConicalIcon className="size-4" />} title="Investigations">
            <ul className="space-y-1.5">
                {investigations.map((investigation, index) => (
                    <li key={index} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">{investigation.name_text}</span>
                        {investigation.reason && (
                            <span className="text-slate-400"> — {investigation.reason}</span>
                        )}
                    </li>
                ))}
            </ul>
        </Section>
    );
}
