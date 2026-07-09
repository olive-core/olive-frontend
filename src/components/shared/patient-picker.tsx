import { UserPlusIcon } from "lucide-react";
import { getAgeFromDOB } from "@/lib/utils";
import type { PatientSummary } from "@/lib/patient";

interface PatientPickerProps {
    candidates: PatientSummary[];
    onSelect: (patient: PatientSummary) => void;
    onNew: () => void;
    title?: string;
}

// The point-of-care picker: shown when a phone holds more than one patient. One
// tap selects the person; "New patient" falls through to registration.
export default function PatientPicker({ candidates, onSelect, onNew, title = "Who's the patient?" }: PatientPickerProps) {
    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-3">
            <p className="text-center text-muted-foreground">{title}</p>
            <div className="grid gap-2 sm:grid-cols-2">
                {candidates.map((patient) => (
                    <button
                        key={patient.patient_id}
                        type="button"
                        onClick={() => onSelect(patient)}
                        className="flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-primary"
                    >
                        <span className="text-base font-semibold">
                            {patient.first_name} {patient.last_name}
                            {patient.is_self && (
                                <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">You</span>
                            )}
                        </span>
                        <span className="text-sm text-muted-foreground capitalize">
                            {patient.date_of_birth ? `${getAgeFromDOB(patient.date_of_birth).years}y` : ""}
                            {patient.sex ? ` · ${patient.sex}` : ""}
                        </span>
                    </button>
                ))}
                <button
                    type="button"
                    onClick={onNew}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    <UserPlusIcon className="size-4" /> New patient
                </button>
            </div>
        </div>
    );
}
