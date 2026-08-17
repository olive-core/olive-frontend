import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MultiStepForm from '@/components/shared/multi-step-form'
import DuplicateGate from '@/components/shared/duplicate-gate'
import type { MultiStepFormSteps } from '@/types/shared'
import { MarsIcon, MicIcon, TransgenderIcon, VenusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { handleError } from '@/lib/utils'
import { getSubscriptionStatusFromError, isSubscriptionBlocked } from '@/lib/subscription'
import type { SubscriptionStatus } from '@/types/subscription'
import { useSubscriptionGate } from '@/stores/subscription-gate-store'
import { useGraceGuard } from '@/hooks/use-grace-guard'
import { useNavigate } from '@tanstack/react-router'
import api from '@/lib/axios'
import { createPatient, dobFromAge, findSimilar, linkPhone, type SimilarMatch } from '@/lib/patient'
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
    onExistingPatientReady?: (patientId: string) => void;
}

export default function NewPatient({ phone, name, age, sex, userId, onExistingPatientReady }: NewPatientProps) {

    const navigate = useNavigate();
    const { userId: clinicianId } = useAuthStore();
    const defaultChamberId = useDefaultChamberId(clinicianId);
    const showSubscriptionGate = useSubscriptionGate((s) => s.show);
    const { guardStart, dialog: graceDialog } = useGraceGuard();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<"form" | "gate" | "review">("form");
    const [matches, setMatches] = useState<SimilarMatch[]>([]);
    const [starting, setStarting] = useState(false);

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
        navigate({ to: "/doctor/consultation/$userId/$consultationId", params: { userId: patientId, consultationId: sessionId } });
    }

    async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
        const response = await api.get<SubscriptionStatus>(`/subscription/${clinicianId}`);
        return response.data;
    }

    // Resolve a patient (creating them only now) then start the metered consultation,
    // grace-guarded. Creation is deferred to here so nothing is written until the doctor
    // commits by pressing Start Consultation.
    //
    // Subscription is checked before that write, not just via the 402 from /session: the
    // patient has to exist before a session can reference it, so a blocked start would
    // otherwise leave a patient behind for a consultation that never happened. The 402
    // handling below still stands as the authority, covering access that lapses mid-flow.
    function resolveAndStart(resolvePatient: () => Promise<string>) {
        guardStart(async () => {
            setStarting(true);
            try {
                const subscription = await fetchSubscriptionStatus();
                if (!subscription.allowed) {
                    showSubscriptionGate(subscription);
                    return;
                }
                await startConsultation(await resolvePatient());
            } catch (error) {
                if (isSubscriptionBlocked(error)) {
                    showSubscriptionGate(getSubscriptionStatusFromError(error));
                    return;
                }
                handleError(error, "An error occurred while creating the patient.");
            } finally {
                setStarting(false);
            }
        });
    }

    const proceed = () => {
        if (!userId) {
            resolveAndStart(() => createNew(form.getValues()));
            return;
        }
        resolveExisting(() => updateExisting(form.getValues()));
    };

    async function resolveExisting(resolvePatient: () => Promise<string>) {
        setStarting(true);
        try {
            const patientId = await resolvePatient();
            onExistingPatientReady?.(patientId);
        } catch (error) {
            handleError(error, "An error occurred while updating the patient.");
        } finally {
            setStarting(false);
        }
    }

    async function createNew(values: PatientFormValues): Promise<string> {
        const patient = await createPatient({
            name: values.name,
            date_of_birth: dobFromAge(values.age),
            sex: values.sex,
            phone: fullPhone,
        });
        return patient.patient_id;
    }

    async function updateExisting(values: PatientFormValues): Promise<string> {
        await api.put(`/patient/${userId}`, {
            name: values.name,
            date_of_birth: dobFromAge(values.age),
            sex: values.sex,
        });
        return userId!;
    }

    async function onSubmit(values: PatientFormValues) {
        // Editing a known patient skips the duplicate gate — straight to review.
        if (userId) {
            setStep("review");
            return;
        }
        // A new patient passes through the gate first; with no match it goes to review,
        // where the record is created only on Start Consultation.
        try {
            const similar = await findSimilar({ name: values.name, sex: values.sex, age: parseInt(values.age, 10) });
            if (similar.length > 0) {
                setMatches(similar);
                setStep("gate");
                return;
            }
            setStep("review");
        } catch (error) {
            handleError(error, "An error occurred while creating the patient.");
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
                    busy={starting}
                    onLink={(patientId) => resolveExisting(async () => {
                        await linkPhone(patientId, fullPhone);
                        return patientId;
                    })}
                    onCreateNew={() => setStep("review")}
                />
                {graceDialog}
            </>
        );
    }

    if (step === "review") {
        const values = form.getValues();
        return (
            <>
                <div className="flex w-full max-w-md flex-col gap-3 mx-auto">
                    <Item variant="outline">
                        <ItemContent>
                            <ItemTitle className="text-lg">{values.name}</ItemTitle>
                            <ItemDescription>
                                <span className="text-sm text-slate-600 capitalize">{values.age}y · {values.sex}</span>
                            </ItemDescription>
                        </ItemContent>
                        <Button autoFocus className="w-full" onClick={proceed} isLoading={starting} disabled={starting}>
                            <MicIcon className="size-4" /> Start Consultation
                        </Button>
                    </Item>
                    <Button variant="ghost" size="sm" className="self-center" onClick={() => setStep("form")} disabled={starting}>
                        Back
                    </Button>
                </div>
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
