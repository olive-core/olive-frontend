import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import toast from "react-hot-toast";
import { handleError } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const patientSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required").refine(
        (val) => new Date(val) <= new Date(),
        "Date of birth cannot be in the future"
    ),
    sex: z.string().min(1, "Sex is required"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface CreatePatientFormProps {
    phoneNumber: string[];
}

const TOTAL_STEPS = 3;

export default function CreatePatientForm({ phoneNumber }: CreatePatientFormProps) {
    const navigate = useNavigate();
    const { storePendingPatient, sendOtp } = useAuthStore();
    const [step, setStep] = useState(0);
    const [prevStep, setPrevStep] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: { firstName: "", lastName: "", dateOfBirth: "", sex: "" },
    });

    const { register, trigger, formState: { errors }, getValues } = form;

    const direction = prevStep < step ? 1 : -1;

    async function goNext() {
        const fields: (keyof PatientFormValues)[] = ['firstName', 'lastName'];
        if (step < fields.length) {
            const valid = await trigger(fields[step]);
            if (!valid) return;
        }
        setPrevStep(step);
        setStep(step + 1);
    }

    function goPrev() {
        setPrevStep(step);
        setStep(step - 1);
    }

    async function submit() {
        const isValid = await trigger(['dateOfBirth', 'sex']);
        if (!isValid) return;

        setIsSubmitting(true);
        const values = getValues();
        storePendingPatient({
            firstName: values.firstName,
            lastName: values.lastName,
            dateOfBirth: values.dateOfBirth,
            sex: values.sex,
        });
        try {
            await sendOtp("+88".concat(phoneNumber.join("").trim()));
            toast.success("OTP sent successfully!");
            navigate({ to: "/enter-otp", search: { exists: 0, role_intent: 'patient' } });
        } catch (error) {
            handleError(error, "Failed to send OTP. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="max-w-xl mx-auto py-10 flex flex-col justify-between items-center h-[400px]">
            <CardHeader className="w-full">
                <CardTitle className="text-center">Create Patient Profile</CardTitle>
            </CardHeader>

            <div className="px-6 pb-4 w-full">
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                </div>
            </div>

            <CardContent className="w-full flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0.5, x: direction * 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0.5 }}
                        transition={{ opacity: { duration: 0.1 }, x: { duration: 0.2 } }}
                        className="space-y-4"
                    >
                        {step === 0 && (
                            <Field data-invalid={!!errors.firstName}>
                                <FieldLabel htmlFor="firstName" className="text-center text-muted-foreground block">First Name</FieldLabel>
                                <Input {...register('firstName')} id="firstName" placeholder="First Name" autoFocus autoComplete="given-name" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "firstName-error" : undefined} />
                                {errors.firstName && <FieldError id="firstName-error" errors={[errors.firstName]} />}
                            </Field>
                        )}
                        {step === 1 && (
                            <Field data-invalid={!!errors.lastName}>
                                <FieldLabel htmlFor="lastName" className="text-center text-muted-foreground block">Last Name</FieldLabel>
                                <Input {...register('lastName')} id="lastName" placeholder="Last Name" autoFocus autoComplete="family-name" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "lastName-error" : undefined} />
                                {errors.lastName && <FieldError id="lastName-error" errors={[errors.lastName]} />}
                            </Field>
                        )}
                        {step === 2 && (
                            <div className="space-y-4">
                                <Field data-invalid={!!errors.dateOfBirth}>
                                    <FieldLabel htmlFor="dateOfBirth" className="text-center text-muted-foreground block">Date of Birth</FieldLabel>
                                    <Input
                                        {...register('dateOfBirth')}
                                        id="dateOfBirth"
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        autoComplete="bday"
                                        aria-invalid={!!errors.dateOfBirth}
                                        aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                                        autoFocus
                                    />
                                    {errors.dateOfBirth && <FieldError id="dateOfBirth-error" errors={[errors.dateOfBirth]} />}
                                </Field>
                                <Field data-invalid={!!errors.sex}>
                                    <FieldLabel htmlFor="sex" className="text-center text-muted-foreground block">Sex</FieldLabel>
                                    <select
                                        {...register('sex')}
                                        id="sex"
                                        aria-invalid={!!errors.sex}
                                        aria-describedby={errors.sex ? "sex-error" : undefined}
                                        className="w-full h-11 sm:h-9 rounded-md border border-input bg-white px-3 py-1 text-base sm:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="" disabled>Select sex</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non_binary">Non-binary</option>
                                    </select>
                                    {errors.sex && <FieldError id="sex-error" errors={[errors.sex]} />}
                                </Field>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between mt-6 w-full">
                <Button type="button" variant="outline" onClick={goPrev} disabled={step === 0}>
                    Previous
                </Button>
                {step < TOTAL_STEPS - 1 ? (
                    <Button type="button" onClick={goNext} shortCutKey="⏎">Next</Button>
                ) : (
                    <Button type="button" onClick={submit} isLoading={isSubmitting} shortCutKey="⏎">
                        Submit
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
