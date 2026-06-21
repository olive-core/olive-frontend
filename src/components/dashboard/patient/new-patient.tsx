import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MultiStepForm from '@/components/shared/multi-step-form'
import type { MultiStepFormSteps } from '@/types/shared'
import { MarsIcon, TransgenderIcon, VenusIcon } from 'lucide-react'
import { handleError } from '@/lib/utils'
import { getSubscriptionStatusFromError, isSubscriptionBlocked } from '@/lib/subscription'
import { useSubscriptionGate } from '@/stores/subscription-gate-store'
import { useGraceGuard } from '@/hooks/use-grace-guard'
import { useNavigate } from '@tanstack/react-router'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const patientSchema = z.object({
    name: z.string(),
    // birthYear: z
    //     .string()
    //     .regex(/^(19|20)\d{2}$/, "Enter a valid year"),
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

export default function NewPatient({ phone, name, age, sex, userId }: NewPatientProps) {

    const navigate = useNavigate();
    const { userId: clinicianId } = useAuthStore();
    const showSubscriptionGate = useSubscriptionGate((s) => s.show);
    const { guardStart, dialog: graceDialog } = useGraceGuard();
    const queryClient = useQueryClient();

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: name || '',
            // birthYear: '',
            age: age || '',
            sex: sex || 'male',
        },
    })

    const createOrUpdatePatient = async (values: PatientFormValues): Promise<string> => {

        const apiEndPoint = userId ? `/patient/${userId}` : "/patient/by-clinician";



        const [firstName, ...lastNames] = values.name.split(" ");
        const lastName = lastNames.join(" ");

        const dob = new Date(
            new Date().getFullYear() - parseInt(values.age, 10),
            0,
            1
        );

        const payload: {
            first_name: string;
            last_name: string;
            date_of_birth: string;
            sex: string;
            phone?: string;
        } = {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dob.toISOString().split("T")[0],
            sex: values.sex,
            phone: `+88${phone}`
        }

        if (userId) {
            delete payload.phone;
            await api.put(apiEndPoint, payload);
            return userId;
        } else {
            const response = await api.post(apiEndPoint, payload);
            return response.data.user_id;
        }

    }

    const mutation = useMutation({
        mutationFn: createOrUpdatePatient,
        onSuccess: () => {
            // TODO: Invalidate or update relevant queries if needed
        }
    })

    const onSubmit = async (values: PatientFormValues) => guardStart(() => submitConsultation(values));

    async function submitConsultation(values: PatientFormValues) {
        try {

            // create | edit patient -> create consultation -> navigate to consultation page

            // TODO: need testing for edit
            const patientId = await mutation.mutateAsync(values);

            const sessionCreateResponse = await api.post("/session", {
                patient_id: patientId,
                clinician_id: clinicianId,
            });

            const sessionId = sessionCreateResponse.data.session_id;

            // The session is the unit we meter, so refresh the cached status the navbar reads.
            queryClient.invalidateQueries({ queryKey: ["subscription"] });

            form.reset();

            navigate({ to: "/doctor/consultation/$userId/$consultationId", params: { userId: patientId, consultationId: sessionId } });

        } catch (error) {
            if (isSubscriptionBlocked(error)) {
                showSubscriptionGate(getSubscriptionStatusFromError(error));
                return;
            }
            handleError(error, "An error occurred while creating the patient.");
        }
    }

    const steps: MultiStepFormSteps<PatientFormValues> = [
        {
            def: "input",
            id: "name",
            label: "Name",
            type: "text",
            placeholder: "Patient Name",
        },
        // {
        //     def: "input",
        //     id: "birthYear",
        //     label: "Year of Birth",
        //     type: "text",
        //     placeholder: "e.g., 1980",
        // },
        {
            def: "input",
            id: "age",
            label: "Age",
            type: "text",
            placeholder: "e.g., 30",
        },
        {
            def: "radio",
            id: "sex",
            label: "Sex",
            options: [
                {
                    value: "male",
                    label: "Male",
                    icon: <MarsIcon className="size-4 text-blue-500" />
                },
                {
                    value: "female",
                    label: "Female",
                    icon: <VenusIcon className="size-4 text-pink-500" />
                },
                {
                    value: "non_binary",
                    label: "Non-binary",
                    icon: <TransgenderIcon className="size-4 text-purple-500" />
                },
            ],
        }
    ]

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
