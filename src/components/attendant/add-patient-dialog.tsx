import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarIcon, MarsIcon, TransgenderIcon, VenusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import MultiStepForm from "@/components/shared/multi-step-form";
import NumberGroupInputMemo from "@/components/dashboard/number-group-input";
import PatientPicker from "@/components/shared/patient-picker";
import DuplicateGate from "@/components/shared/duplicate-gate";
import type { MultiStepFormSteps } from "@/types/shared";
import { addToQueue } from "@/lib/attendant-queue";
import { createPatient, findSimilar, getPatient, linkPhone, lookupByPhone, type PatientSummary, type SimilarMatch } from "@/lib/patient";
import { getAgeFromDOB, handleError } from "@/lib/utils";

type Step = "phone" | "pick" | "form" | "gate" | "confirm";

interface AddPatientDialogProps {
    chamberId: string;
    open: boolean;
    onClose: () => void;
}

const emptyPhone = () => ["0", "1"].concat(Array(9).fill(""));

const patientSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    age: z.string().refine((val) => {
        const age = parseInt(val, 10);
        return age >= 0 && age <= 120;
    }, "Enter a valid age between 0 and 120"),
    sex: z.enum(["male", "female", "non_binary"]),
});
type PatientFormValues = z.infer<typeof patientSchema>;

const FORM_STEPS: MultiStepFormSteps<PatientFormValues> = [
    { def: "input", id: "name", label: "Name", type: "text", placeholder: "Patient name" },
    { def: "input", id: "age", label: "Age", type: "text", placeholder: "e.g., 30" },
    {
        def: "radio",
        id: "sex",
        label: "Sex",
        options: [
            { value: "male", label: "Male", icon: <MarsIcon className="size-4 text-blue-500" /> },
            { value: "female", label: "Female", icon: <VenusIcon className="size-4 text-pink-500" /> },
            { value: "non_binary", label: "Non-binary", icon: <TransgenderIcon className="size-4 text-purple-500" /> },
        ],
    },
];

function splitName(name: string) {
    const [firstName, ...rest] = name.trim().split(" ");
    return { firstName, lastName: rest.join(" ") };
}

function dobFromAge(age: string) {
    return new Date(new Date().getFullYear() - parseInt(age, 10), 0, 1).toISOString().split("T")[0];
}

export default function AddPatientDialog({ chamberId, open, onClose }: AddPatientDialogProps) {
    const queryClient = useQueryClient();
    const [phone, setPhone] = useState<string[]>(emptyPhone);
    const [step, setStep] = useState<Step>("phone");
    const [candidates, setCandidates] = useState<PatientSummary[]>([]);
    const [matches, setMatches] = useState<SimilarMatch[]>([]);
    const [selected, setSelected] = useState<PatientSummary | null>(null);
    const [busy, setBusy] = useState(false);

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: { name: "", age: "", sex: "male" },
    });

    const fullPhone = () => "+88" + phone.join("").trim();

    const close = () => {
        onClose();
        setTimeout(() => {
            setPhone(emptyPhone());
            setStep("phone");
            setCandidates([]);
            setMatches([]);
            setSelected(null);
            form.reset({ name: "", age: "", sex: "male" });
        }, 200);
    };

    const lookup = useCallback(async (isComplete: boolean) => {
        if (!isComplete) return;
        setBusy(true);
        try {
            const found = await lookupByPhone("+88" + phone.join("").trim());
            if (found.length === 0) {
                form.reset({ name: "", age: "", sex: "male" });
                setStep("form");
            } else if (found.length === 1) {
                setSelected(found[0]);
                setStep("confirm");
            } else {
                setCandidates(found);
                setStep("pick");
            }
        } catch (error) {
            handleError(error, "Could not look up this number");
        } finally {
            setBusy(false);
        }
    }, [phone, form]);

    const savePatient = async (values: PatientFormValues) => {
        const { firstName, lastName } = splitName(values.name);
        setBusy(true);
        try {
            const similar = await findSimilar({ first_name: firstName, last_name: lastName, sex: values.sex, age: parseInt(values.age, 10) });
            if (similar.length > 0) {
                setMatches(similar);
                setStep("gate");
                return;
            }
            await createAndSelect(values);
        } catch (error) {
            handleError(error, "Could not save this patient");
        } finally {
            setBusy(false);
        }
    };

    const createAndSelect = async (values: PatientFormValues) => {
        const { firstName, lastName } = splitName(values.name);
        const patient = await createPatient({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dobFromAge(values.age),
            sex: values.sex,
            phone: fullPhone(),
        });
        setSelected(patient);
        setStep("confirm");
    };

    const linkExisting = async (patientId: string) => {
        setBusy(true);
        try {
            await linkPhone(patientId, fullPhone());
            setSelected(await getPatient(patientId));
            setStep("confirm");
        } catch (error) {
            handleError(error, "Could not link this number");
        } finally {
            setBusy(false);
        }
    };

    const enqueue = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            await addToQueue(chamberId, selected.patient_id, fullPhone());
            queryClient.invalidateQueries({ queryKey: ["queue", chamberId] });
            toast.success("Added to queue");
            close();
        } catch (error) {
            handleError(error, "Could not add to queue");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && close()}>
            <DialogContent>
                {step === "phone" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Patient phone number</DialogTitle>
                        </DialogHeader>
                        <div className="pt-2">
                            <NumberGroupInputMemo numberInput={phone} setNumberInput={setPhone} onComplete={lookup} />
                            {busy && <p className="text-sm text-muted-foreground text-center mt-3">Looking up…</p>}
                        </div>
                    </>
                )}

                {step === "pick" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Who's the patient?</DialogTitle>
                        </DialogHeader>
                        <PatientPicker
                            candidates={candidates}
                            title=""
                            onSelect={(patient) => { setSelected(patient); setStep("confirm"); }}
                            onNew={() => { form.reset({ name: "", age: "", sex: "male" }); setStep("form"); }}
                        />
                    </>
                )}

                {step === "form" && (
                    <MultiStepForm title="New patient" steps={FORM_STEPS} onSubmit={savePatient} form={form} />
                )}

                {step === "gate" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Possible match</DialogTitle>
                        </DialogHeader>
                        <DuplicateGate
                            matches={matches}
                            busy={busy}
                            onLink={linkExisting}
                            onCreateNew={() => savePatientCreateOnly()}
                        />
                    </>
                )}

                {step === "confirm" && selected && (
                    <ConfirmCard patient={selected} busy={busy} onAdd={enqueue} />
                )}
            </DialogContent>
        </Dialog>
    );

    async function savePatientCreateOnly() {
        setBusy(true);
        try {
            await createAndSelect(form.getValues());
        } catch (error) {
            handleError(error, "Could not save this patient");
        } finally {
            setBusy(false);
        }
    }
}

interface ConfirmCardProps {
    patient: PatientSummary;
    busy: boolean;
    onAdd: () => void;
}

function ConfirmCard({ patient, busy, onAdd }: ConfirmCardProps) {
    const age = patient.date_of_birth ? getAgeFromDOB(patient.date_of_birth).years : null;
    return (
        <>
            <DialogHeader>
                <DialogTitle>Confirm patient</DialogTitle>
            </DialogHeader>
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle className="text-lg">
                        {patient.first_name} {patient.last_name}
                    </ItemTitle>
                    <ItemDescription>
                        <span className="flex items-center gap-1 text-slate-600 text-sm">
                            <CalendarIcon className="size-4" /> {age != null ? `${age}y` : ""}
                            {patient.sex && <span className="capitalize ml-2">· {patient.sex}</span>}
                        </span>
                    </ItemDescription>
                </ItemContent>
                <Button className="w-full" onClick={onAdd} isLoading={busy}>
                    Add to Queue
                </Button>
            </Item>
        </>
    );
}
