import { PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimilarMatch } from "@/lib/patient";

interface DuplicateGateProps {
    matches: SimilarMatch[];
    busy?: boolean;
    onLink: (patientId: string) => void;
    onCreateNew: () => void;
}

// Shown between the new-patient form and creation when the gate finds likely
// duplicates. Recognising a familiar number links this visit to the existing
// patient instead of creating a second record.
export default function DuplicateGate({ matches, busy, onLink, onCreateNew }: DuplicateGateProps) {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-3">
            <div className="text-center">
                <p className="font-medium">Is one of these numbers familiar to you?</p>
                <p className="text-sm text-muted-foreground">This patient looks similar to someone already registered.</p>
            </div>
            <div className="flex flex-col gap-2">
                {matches.map((match) => (
                    <button
                        key={match.patient_id}
                        type="button"
                        disabled={busy}
                        onClick={() => onLink(match.patient_id)}
                        className="flex flex-col gap-1.5 rounded-xl border-2 border-amber-200 bg-amber-50/60 px-4 py-3 text-left transition-colors cursor-pointer hover:border-amber-400 disabled:cursor-default disabled:opacity-50"
                    >
                        <span className="flex items-baseline justify-between gap-3">
                            <span className="font-semibold">{match.name}</span>
                            <span className="text-sm text-muted-foreground capitalize">
                                {match.age != null ? `${match.age}y` : ""}
                                {match.sex ? ` · ${match.sex}` : ""}
                            </span>
                        </span>
                        {match.masked_numbers.length > 0 ? (
                            <span className="flex flex-wrap gap-x-4 gap-y-1">
                                {match.masked_numbers.map((number, index) => (
                                    <span key={index} className="flex items-center gap-1.5 font-mono text-sm text-slate-700">
                                        <PhoneIcon className="size-3.5 text-slate-400" /> {number}
                                    </span>
                                ))}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground">No number on file</span>
                        )}
                    </button>
                ))}
            </div>
            <Button variant="outline" onClick={onCreateNew} disabled={busy}>
                None of these — create new
            </Button>
        </div>
    );
}
