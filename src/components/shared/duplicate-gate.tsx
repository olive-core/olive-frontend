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
                        className="flex items-center justify-between gap-3 rounded-xl border-2 border-amber-200 bg-amber-50/60 px-4 py-3 text-left transition-colors hover:border-amber-400 disabled:opacity-50"
                    >
                        <span>
                            <span className="block font-semibold">{match.first_name} {match.last_name}</span>
                            <span className="text-sm text-muted-foreground capitalize">
                                {match.age != null ? `${match.age}y` : ""}
                                {match.sex ? ` · ${match.sex}` : ""}
                            </span>
                        </span>
                        <span className="font-mono text-sm text-slate-600">{match.masked_numbers[0] ?? ""}</span>
                    </button>
                ))}
            </div>
            <Button variant="outline" onClick={onCreateNew} disabled={busy}>
                None of these — create new
            </Button>
        </div>
    );
}
