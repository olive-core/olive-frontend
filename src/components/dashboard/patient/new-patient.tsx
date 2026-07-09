import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MultiStepForm from '@/components/shared/multi-step-form'
import DuplicateGate from '@/components/shared/duplicate-gate'
import type { MultiStepFormSteps } from '@/types/shared'
import { MarsIcon, TransgenderIcon, VenusIcon } from 'lucide-react'
import { handleError } from '@/lib/utils'
import { getSubscriptionStatusFromError, isSubscriptionBlocked } from '@/lib/subscription'
import { useSubscriptionGate } from '@/stores/subscription-gate-store'
import { useGraceGuard } from '@/hooks/use-grace-guard'
import { useNavigate } from '@tanstack/react-router'
import api from '@/lib/axios'
import { createPatient, findSimilar, linkPhone, type SimilarMatch } from '@/lib/patient'
import { useAuthStore } from '@/stores/auth-store'
import { useDefaultChamberId } from '@/stores/active-chamber-store'
import { useQueryClient } from '@tanstack/react-query'

const patientSchema = z.object({
    name: z.string(),
    age: z.string().refine((val) => {
        const age = parseInt(val, 10);
        return age >= 0 && age <= 120;
    }, {
        message: "Enter a valid age between 0 and 120",
    }),
    sex: z.enum(['male', 'female', 'non_binary']),
})

type PatientFormValues = z.infer<typeof patientSchema>

interface NewPatientProps {
    phone: string;
    name?: string;
    age?: string;
    sex?: 'male' | 'female' | 'non_binary';
    userId?: string;
}

function splitName(name: string) {
    const [firstName, ...rest] = name.trim().split(" ");
    return { firstName, lastName: rest.join(" ") };
}

function dobFromAge(age: string) {
    return new Date(new Date().getFullYear() - parseInt(age, 10), 0, 1).toISOString().split("T")[0];
}

export default function NewPatient({ phone, name, age, sex, userId }: NewPatientProps) {

    const navigate = useNavigate();
    const { userId: clinicianId } = useAuthStore();
    const defaultChamberId = useDefaultChamberId(clinicianId);
    const showSubscriptionGate = useSubscriptionGate((s) => s.show);
    const { guardStart, dialog: graceDialog } = useGraceGuard();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<"form" | "gate">("form");
    const [matches, setMatches] = useState<SimilarMatch[]>([]);
    const [busy, setBusy] = useState(false);

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: { name: name || '', age: age || '', sex: sex || 'male' },
    })

    const fullPhone = `+88${phone}`;

    // Create the session for a resolved patient and move into the consultation.
    async function startConsultation(patientId: string) {
        const sessionCreateResponse = await api.post("/session", {
            patient_id: patientId,
            clinician_id: clinicianId,
            ...(defaultChamberId ? { chamber_id: defaultChamberId } : {}),
            contact_phone: fullPhone,
        });
        const sessionId = sessionCreateResponse.data.session_id;
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        form.reset();
        navigate({ to: "/doctor/consultation/$userId/$consultationId", params: { userId: patientId, consultationId: sessionId } });
    }

    // Resolve a patient then start the (metered) consultation, grace-guarded.
    function resolveAndStart(resolvePatient: () => Promise<string>) {
        guardStart(async () => {
            try {
                await startConsultation(await resolvePatient());
            } catch (error) {
                if (isSubscriptionBlocked(error)) {
                    showSubscriptionGate(getSubscriptionStatusFromError(error));
                    return;
                }
                handleError(error, "An error occurred while creating the patient.");
            }
        });
    }

    async function createNew(values: PatientFormValues): Promise<string> {
        const { firstName, lastName } = splitName(values.name);
        const patient = await createPatient({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dobFromAge(values.age),
            sex: values.sex,
            phone: fullPhone,
        });
        return patient.patient_id;
    }

    async function updateExisting(values: PatientFormValues): Promise<string> {
        const { firstName, lastName } = splitName(values.name);
        await api.put(`/patient/${userId}`, {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dobFromAge(values.age),
            sex: values.sex,
        });
        return userId!;
    }

    async function onSubmit(values: PatientFormValues) {
        // Editing a known patient skips the duplicate gate.
        if (userId) {
            resolveAndStart(() => updateExisting(values));
            return;
        }
        // A new patient passes through the gate first.
        setBusy(true);
        try {
            const { firstName, lastName } = splitName(values.name);
            const similar = await findSimilar({ first_name: firstName, last_name: lastName, sex: values.sex, age: parseInt(values.age, 10) });
            if (similar.length > 0) {
                setMatches(similar);
                setStep("gate");
                return;
            }
            resolveAndStart(() => createNew(values));
        } catch (error) {
            handleError(error, "An error occurred while creating the patient.");
        } finally {
            setBusy(false);
        }
    }

    const steps: MultiStepFormSteps<PatientFormValues> = [
        { def: "input", id: "name", label: "Name", type: "text", placeholder: "Patient Name" },
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
        }
    ]

    if (step === "gate") {
        return (
            <>
                <DuplicateGate
                    matches={matches}
                    busy={busy}
                    onLink={(patientId) => resolveAndStart(async () => { await linkPhone(patientId, fullPhone); return patientId; })}
                    onCreateNew={() => resolveAndStart(() => createNew(form.getValues()))}
                />
                {graceDialog}
            </>
        );
    }

    return (
        <>
            <MultiStepForm
                title="New Patient Information"
                steps={steps}
                onSubmit={onSubmit}
                form={form}
            />
            {graceDialog}
        </>
    )
}
