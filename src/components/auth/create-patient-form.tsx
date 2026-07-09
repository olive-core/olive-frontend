import { useAuthStore } from "@/stores/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import toast from "react-hot-toast";
import { handleError } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarsIcon, TransgenderIcon, VenusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dobFromAge } from "@/lib/patient";

const SEX_OPTIONS = [
    { value: "male", label: "Male", icon: MarsIcon, iconClassName: "text-blue-500" },
    { value: "female", label: "Female", icon: VenusIcon, iconClassName: "text-pink-500" },
    { value: "non_binary", label: "Non-binary", icon: TransgenderIcon, iconClassName: "text-purple-500" },
] as const;

const patientSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    age: z.string().min(1, "Age is required").refine(
        (val) => {
            const age = parseInt(val, 10);
            return age >= 0 && age <= 120;
        },
        "Enter a valid age between 0 and 120"
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
        defaultValues: { firstName: "", lastName: "", age: "", sex: "male" },
    });

    const { register, trigger, formState: { errors }, getValues, watch, setValue } = form;
    const selectedSex = watch("sex");

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
        const isValid = await trigger(['age', 'sex']);
        if (!isValid) return;

        setIsSubmitting(true);
        const values = getValues();
        storePendingPatient({
            firstName: values.firstName,
            lastName: values.lastName,
            dateOfBirth: dobFromAge(values.age),
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
                                <Field data-invalid={!!errors.age}>
                                    <FieldLabel htmlFor="age" className="text-center text-muted-foreground block">Age</FieldLabel>
                                    <Input
                                        {...register('age')}
                                        id="age"
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        max={120}
                                        placeholder="e.g., 30"
                                        aria-invalid={!!errors.age}
                                        aria-describedby={errors.age ? "age-error" : undefined}
                                        autoFocus
                                    />
                                    {errors.age && <FieldError id="age-error" errors={[errors.age]} />}
                                </Field>
                                <Field data-invalid={!!errors.sex}>
                                    <FieldLabel className="text-center text-muted-foreground block">Sex</FieldLabel>
                                    <input type="hidden" {...register('sex')} />
                                    <div className="grid grid-cols-3 gap-2">
                                        {SEX_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setValue('sex', option.value, { shouldValidate: true })}
                                                aria-pressed={selectedSex === option.value}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-colors cursor-pointer",
                                                    selectedSex === option.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-slate-200 hover:border-slate-300",
                                                )}
                                            >
                                                <option.icon className={cn("size-5", option.iconClassName)} />
                                                <span className="text-sm font-medium text-slate-700">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
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
