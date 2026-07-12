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
import { createPatient, dobFromAge, findSimilar, getPatient, linkPhone, lookupByPhone, type PatientSummary, type SimilarMatch } from "@/lib/patient";
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

export default function AddPatientDialog({ chamberId, open, onClose }: AddPatientDialogProps) {
    const queryClient = useQueryClient();
    const [phone, setPhone] = useState<string[]>(emptyPhone);
    const [step, setStep] = useState<Step>("phone");
    const [candidates, setCandidates] = useState<PatientSummary[]>([]);
    const [matches, setMatches] = useState<SimilarMatch[]>([]);
    // The confirm card is reached either with an existing patient (linked from the gate) or
    // a new-patient draft that is created only when "Add to Queue" is pressed.
    const [selected, setSelected] = useState<PatientSummary | null>(null);
    const [draft, setDraft] = useState<PatientFormValues | null>(null);
    const [busy, setBusy] = useState(false);
    const [enqueuingId, setEnqueuingId] = useState<string | null>(null);

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
            setDraft(null);
            form.reset({ name: "", age: "", sex: "male" });
        }, 200);
    };

    const lookup = useCallback(async (isComplete: boolean) => {
        if (!isComplete) return;
        setBusy(true);
        try {
            const found = await lookupByPhone("+88" + phone.join("").trim());
            // A phone may already reach one or more patients; always show the picker so
            // "New patient" stays available even when there's exactly one.
            if (found.length === 0) {
                form.reset({ name: "", age: "", sex: "male" });
                setStep("form");
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
        setBusy(true);
        try {
            const similar = await findSimilar({ name: values.name, sex: values.sex, age: parseInt(values.age, 10) });
            if (similar.length > 0) {
                setMatches(similar);
                setStep("gate");
                return;
            }
            // No match — review before creating anything.
            setSelected(null);
            setDraft(values);
            setStep("confirm");
        } catch (error) {
            handleError(error, "Could not save this patient");
        } finally {
            setBusy(false);
        }
    };

    const linkExisting = async (patientId: string) => {
        setBusy(true);
        try {
            await linkPhone(patientId, fullPhone());
            setDraft(null);
            setSelected(await getPatient(patientId));
            setStep("confirm");
        } catch (error) {
            handleError(error, "Could not link this number");
        } finally {
            setBusy(false);
        }
    };

    // Enqueue an already-existing patient straight from the picker.
    const enqueue = async (patient: PatientSummary) => {
        setEnqueuingId(patient.patient_id);
        try {
            await addToQueue(chamberId, patient.patient_id, fullPhone());
            queryClient.invalidateQueries({ queryKey: ["queue", chamberId] });
            toast.success("Added to queue");
            close();
        } catch (error) {
            handleError(error, "Could not add to queue");
        } finally {
            setEnqueuingId(null);
        }
    };

    // Confirm card action: create the drafted patient if there is one (so nothing is
    // written until now), then add whoever we resolved to the queue.
    const confirmAndQueue = async () => {
        setBusy(true);
        try {
            let patientId = selected?.patient_id;
            if (!patientId && draft) {
                const created = await createPatient({
                    name: draft.name,
                    date_of_birth: dobFromAge(draft.age),
                    sex: draft.sex,
                    phone: fullPhone(),
                });
                patientId = created.patient_id;
            }
            if (!patientId) return;
            await addToQueue(chamberId, patientId, fullPhone());
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
                            actionLabel="Add to Queue"
                            onAction={enqueue}
                            busyPatientId={enqueuingId}
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
                            onCreateNew={() => { setSelected(null); setDraft(form.getValues()); setStep("confirm"); }}
                        />
                    </>
                )}

                {step === "confirm" && (selected || draft) && (
                    <ConfirmCard
                        name={selected ? selected.name : draft!.name}
                        detail={selected ? confirmDetail(selected) : `${draft!.age}y · ${draft!.sex}`}
                        busy={busy}
                        onAdd={confirmAndQueue}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function confirmDetail(patient: PatientSummary): string {
    const age = patient.date_of_birth ? `${getAgeFromDOB(patient.date_of_birth).years}y` : "";
    return [age, patient.sex].filter(Boolean).join(" · ");
}

interface ConfirmCardProps {
    name: string;
    detail: string;
    busy: boolean;
    onAdd: () => void;
}

function ConfirmCard({ name, detail, busy, onAdd }: ConfirmCardProps) {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Confirm patient</DialogTitle>
            </DialogHeader>
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle className="text-lg">{name}</ItemTitle>
                    <ItemDescription>
                        <span className="flex items-center gap-1 text-slate-600 text-sm capitalize">
                            <CalendarIcon className="size-4" /> {detail}
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
