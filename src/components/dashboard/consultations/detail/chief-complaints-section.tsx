import { StethoscopeIcon } from "lucide-react";
import Section from "./section";
import type { ChiefComplaintItem } from "@/types/patient";

interface ChiefComplaintsSectionProps {
    chiefComplaints: ChiefComplaintItem[];
}

export default function ChiefComplaintsSection({ chiefComplaints }: ChiefComplaintsSectionProps) {
    if (chiefComplaints.length === 0) return null;

    return (
        <Section icon={<StethoscopeIcon className="size-4" />} title="Chief Complaints">
            <ul className="space-y-1.5">
                {chiefComplaints.map((complaint, index) => (
                    <li key={index} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">{complaint.name_text}</span>
                        {complaint.duration && (
                            <span className="text-slate-400"> · {complaint.duration}</span>
                        )}
                        {complaint.notes && (
                            <span className="text-slate-400"> — {complaint.notes}</span>
                        )}
                    </li>
                ))}
            </ul>
        </Section>
    );
}
