import { UserPlusIcon } from "lucide-react";
import { getAgeFromDOB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PatientSummary } from "@/lib/patient";

interface PatientPickerProps {
    candidates: PatientSummary[];
    onNew: () => void;
    title?: string;
    // The primary action taken straight from a card (start consultation / add to queue),
    // so the desk doesn't need an extra confirm step.
    actionLabel: string;
    onAction: (patient: PatientSummary) => void;
    busyPatientId?: string | null;
    // Optional secondary tap on the card body (e.g. open details / edit).
    onSelect?: (patient: PatientSummary) => void;
}

function meta(patient: PatientSummary) {
    const age = patient.date_of_birth ? `${getAgeFromDOB(patient.date_of_birth).years}y` : "";
    return [age, patient.sex].filter(Boolean).join(" · ");
}

// The point-of-care picker: shown when a phone holds more than one patient. Each card
// carries the primary action so one tap starts the visit; "New patient" registers.
export default function PatientPicker({ candidates, onNew, title = "Who's the patient?", actionLabel, onAction, busyPatientId, onSelect }: PatientPickerProps) {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-3">
            {title && <p className="text-center text-muted-foreground">{title}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
                {candidates.map((patient) => (
                    <div
                        key={patient.patient_id}
                        className="flex flex-col gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3"
                    >
                        <button
                            type="button"
                            onClick={() => onSelect?.(patient)}
                            disabled={!onSelect}
                            className="flex flex-col items-start text-left enabled:cursor-pointer disabled:cursor-default"
                        >
                            <span className="text-base font-semibold">
                                {patient.name}
                            </span>
                            <span className="text-sm text-muted-foreground capitalize">{meta(patient)}</span>
                        </button>
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => onAction(patient)}
                            isLoading={busyPatientId === patient.patient_id}
                            disabled={!!busyPatientId}
                        >
                            {actionLabel}
                        </Button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={onNew}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 font-medium text-muted-foreground transition-colors cursor-pointer hover:border-primary hover:text-primary"
                >
                    <UserPlusIcon className="size-4" /> New patient
                </button>
            </div>
        </div>
    );
}
