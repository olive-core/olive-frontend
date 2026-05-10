import { CalendarClockIcon } from "lucide-react";
import Section from "./section";

interface FollowUpSectionProps {
    days?:  number | null;
    notes?: string | null;
}

export default function FollowUpSection({ days, notes }: FollowUpSectionProps) {
    const hasDays = days !== null && days !== undefined;
    const hasNotes = notes && notes.trim().length > 0;

    if (!hasDays && !hasNotes) return null;

    return (
        <Section icon={<CalendarClockIcon className="size-4" />} title="Follow Up">
            <div className="space-y-1 text-sm text-slate-600">
                {hasDays && (
                    <p>
                        <span className="font-medium text-slate-700">In </span>
                        {days} {days === 1 ? "day" : "days"}
                    </p>
                )}
                {hasNotes && <p className="text-slate-500">{notes}</p>}
            </div>
        </Section>
    );
}
