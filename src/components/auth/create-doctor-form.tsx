import { useAuthStore } from "@/stores/auth-store";
import type { MultiStepFormSteps } from "@/types/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import MultiStepForm from "../shared/multi-step-form";
import toast from "react-hot-toast";
import { handleError } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

const doctorSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    bmdcNo: z.string().regex(/^\d+$/, "BMDC number must contain only numbers"),
    termsAccepted: z.boolean().refine((accepted) => accepted, {
        message: "You must accept the Terms and Conditions to continue",
    }),
})

type DoctorFormValues = z.infer<typeof doctorSchema>

interface CreateDoctorFormProps {
    phoneNumber: string[],
}

export default function CreateDoctorForm({ phoneNumber }: CreateDoctorFormProps) {

    const navigate = useNavigate();

    const { storeClinicianInfo, sendOtp } = useAuthStore();

    const form = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            bmdcNo: "",
            termsAccepted: false,
        }
    })

    async function onSubmit(value: DoctorFormValues) {
        storeClinicianInfo({
            bmdcNo: value.bmdcNo,
            firstName: value.firstName,
            lastName: value.lastName,
        })

        try {
            await sendOtp("+88".concat(phoneNumber.join("").trim()));
            toast.success("OTP sent successfully!");
            navigate({ to: "/enter-otp", search: { exists: 0, role_intent: 'clinician' } });
        } catch (error) {
            handleError(error, "Failed to send OTP. Please try again.");
        }
    }

    const steps: MultiStepFormSteps<DoctorFormValues> = [
        { def: "input", id: "firstName", label: "First Name", type: "text", placeholder: "First Name" },
        { def: "input", id: "lastName", label: "Last Name", type: "text", placeholder: "Last Name" },
        { def: "input", id: "bmdcNo", label: "BMDC No", type: "text", placeholder: "BMDC No" },
        { def: "termsAcceptance", id: "termsAccepted", label: "Terms and Conditions" },
    ]

    return (
        <MultiStepForm
            title="Create Doctor Profile"
            steps={steps}
            onSubmit={onSubmit}
            form={form}
        />
    )
} 