import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { CalendarIcon, MarsIcon, PenIcon, TransgenderIcon, VenusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import MultiStepForm from "@/components/shared/multi-step-form";
import NumberGroupInputMemo from "@/components/dashboard/number-group-input";
import type { MultiStepFormSteps } from "@/types/shared";
import api from "@/lib/axios";
import { addToQueue } from "@/lib/attendant-queue";
import { getAgeFromDOB, handleError } from "@/lib/utils";

type Step = "phone" | "form" | "confirm";

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
    const [patientId, setPatientId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: { name: "", age: "", sex: "male" },
    });

    const close = () => {
        onClose();
        setTimeout(() => {
            setPhone(emptyPhone());
            setStep("phone");
            setPatientId(null);
            form.reset({ name: "", age: "", sex: "male" });
        }, 200);
    };

    const fullPhone = () => "+88" + phone.join("").trim();

    const lookup = useCallback(async (isComplete: boolean) => {
        if (!isComplete) return;
        setBusy(true);
        try {
            const { data } = await api.post("/patient/by-phone", { phone: "+88" + phone.join("").trim() });
            setPatientId(data.user_id);
            setStep("confirm");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                form.reset({ name: "", age: "", sex: "male" });
                setStep("form");
                return;
            }
            handleError(error, "Could not look up this number");
        } finally {
            setBusy(false);
        }
    }, [phone, form]);

    const savePatient = async (values: PatientFormValues) => {
        const [firstName, ...rest] = values.name.trim().split(" ");
        const dob = new Date(new Date().getFullYear() - parseInt(values.age, 10), 0, 1);
        const payload = {
            first_name: firstName,
            last_name: rest.join(" "),
            date_of_birth: dob.toISOString().split("T")[0],
            sex: values.sex,
        };
        try {
            if (patientId) {
                await api.put(`/patient/${patientId}`, payload);
            } else {
                const { data } = await api.post("/patient/by-clinician", { ...payload, phone: fullPhone() });
                setPatientId(data.user_id);
            }
            queryClient.invalidateQueries({ queryKey: ["patient-info", patientId] });
            setStep("confirm");
        } catch (error) {
            handleError(error, "Could not save this patient");
        }
    };

    const enqueue = async () => {
        if (!patientId) return;
        setBusy(true);
        try {
            await addToQueue(chamberId, patientId);
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

                {step === "form" && (
                    <MultiStepForm
                        title={patientId ? "Edit patient" : "New patient"}
                        steps={FORM_STEPS}
                        onSubmit={savePatient}
                        form={form}
                    />
                )}

                {step === "confirm" && patientId && (
                    <ConfirmCard
                        patientId={patientId}
                        busy={busy}
                        onEdit={(values) => {
                            form.reset(values);
                            setStep("form");
                        }}
                        onAdd={enqueue}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ConfirmCardProps {
    patientId: string;
    busy: boolean;
    onEdit: (values: PatientFormValues) => void;
    onAdd: () => void;
}

function ConfirmCard({ patientId, busy, onEdit, onAdd }: ConfirmCardProps) {
    const { data: patient, isLoading } = useQuery({
        queryKey: ["patient-info", patientId],
        queryFn: () => api.get(`/patient/${patientId}`).then((r) => r.data),
    });

    if (isLoading || !patient) {
        return <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>;
    }

    const age = getAgeFromDOB(patient.date_of_birth).years;
    const normalizedSex: PatientFormValues["sex"] =
        patient.sex === "female" ? "female" : patient.sex === "non_binary" ? "non_binary" : "male";

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
                            <CalendarIcon className="size-4" /> {age}y
                            <span className="capitalize ml-2">· {patient.sex}</span>
                        </span>
                    </ItemDescription>
                </ItemContent>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        onEdit({
                            name: `${patient.first_name} ${patient.last_name}`.trim(),
                            age: String(age),
                            sex: normalizedSex,
                        })
                    }
                >
                    <PenIcon className="size-3" /> Edit
                </Button>
                <Button className="w-full" onClick={onAdd} isLoading={busy}>
                    Add to Queue
                </Button>
            </Item>
        </>
    );
}
