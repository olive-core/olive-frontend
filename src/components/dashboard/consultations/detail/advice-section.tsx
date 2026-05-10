import { LightbulbIcon } from "lucide-react";
import Section from "./section";

interface AdviceSectionProps {
    advice: string[];
}

export default function AdviceSection({ advice }: AdviceSectionProps) {
    if (advice.length === 0) return null;

    return (
        <Section icon={<LightbulbIcon className="size-4" />} title="Advice">
            <ul className="list-disc list-inside space-y-1">
                {advice.map((line, index) => (
                    <li key={index} className="text-sm text-slate-600">
                        {line}
                    </li>
                ))}
            </ul>
        </Section>
    );
}
