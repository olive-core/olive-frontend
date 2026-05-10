import { HistoryIcon } from "lucide-react";
import Section from "./section";
import type { ConsultationHistoryItem } from "@/types/consultation";

interface HistorySectionProps {
    histories: ConsultationHistoryItem[];
}

export default function HistorySection({ histories }: HistorySectionProps) {
    if (histories.length === 0) return null;

    return (
        <Section icon={<HistoryIcon className="size-4" />} title="History">
            <ul className="space-y-1.5">
                {histories.map((history, index) => (
                    <li key={index} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">{history.name_text}</span>
                        {history.duration && (
                            <span className="text-slate-400"> · {history.duration}</span>
                        )}
                        {history.notes && (
                            <span className="text-slate-400"> — {history.notes}</span>
                        )}
                    </li>
                ))}
            </ul>
        </Section>
    );
}
