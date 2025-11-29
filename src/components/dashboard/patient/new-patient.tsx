import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MultiStepForm from '@/components/shared/multi-step-form'
import type { MultiStepFormSteps } from '@/types/shared'
import { MarsIcon, TransgenderIcon, VenusIcon } from 'lucide-react'

const patientSchema = z.object({
    name: z.string(),
    birthYear: z
        .string()
        .regex(/^(19|20)\d{2}$/, "Enter a valid year"),
    sex: z.enum(['male', 'female', 'non_binary']),
})

type PatientFormValues = z.infer<typeof patientSchema>

interface NewPatientProps {
    phone: string;
}

export default function NewPatient({ phone }: NewPatientProps) {
    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: '',
            birthYear: '',
            sex: 'male',
        },
    })

    async function onSubmit(values: PatientFormValues) {
        console.log('Submitting form values:', values, phone)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        form.reset()
    }

    const steps: MultiStepFormSteps<PatientFormValues> = [
        {
            def: "input",
            id: "name",
            label: "Name",
            type: "text",
            placeholder: "Patient Name",
        },
        {
            def: "input",
            id: "birthYear",
            label: "Year of Birth",
            type: "text",
            placeholder: "e.g., 1980",
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
