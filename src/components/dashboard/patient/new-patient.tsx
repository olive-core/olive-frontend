import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MultiStepForm from '@/components/shared/multi-step-form'
import type { MultiStepFormSteps } from '@/types/shared'
import { MarsIcon, TransgenderIcon, VenusIcon } from 'lucide-react'
import { handleError } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import api from '@/lib/axios'

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
}

export default function NewPatient({ phone }: NewPatientProps) {

    const navigate = useNavigate();

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: '',
            // birthYear: '',
            age: '',
            sex: 'male',
        },
    })

    async function onSubmit(values: PatientFormValues) {
        try {

            const [firstName, ...lastNames] = values.name.split(" ");
            const lastName = lastNames.join(" ");

            const payload = {
                first_name: firstName,
                last_name: lastName,
                // birthYear: parseInt(values.birthYear, 10),
                age: parseInt(values.age, 10),
                phone,
            }

            const response = await api.post("/patient/by-clinician", payload);
            console.log("Patient created:", response.data);

            // create patient -> create consultation -> navigate to consultation page

            form.reset();

            navigate({ to: "/dashboard/consultation/$userId/$consultationId", params: { userId: "1", consultationId: "1" } });

        } catch (error) {
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
        <MultiStepForm
            title="New Patient Information"
            steps={steps}
            onSubmit={onSubmit}
            form={form}
        />
    )
}
