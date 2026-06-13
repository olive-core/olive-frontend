"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/auth-store"
import { useState } from "react"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { AxiosError } from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { XIcon } from "lucide-react"

const formSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    bmdcNo: z.string().regex(/^\d+$/, "BMDC number must contain only numbers"),
    qualification: z.string(),
    specializations: z.array(z.string()).optional(),
    defaultGeneration: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProfileFormProps {
    clinicianData: {
        "user_id": string;
        "first_name": string;
        "last_name": string;
        "bmdc_no": string;
        "qualification": string;
        "specializations": string[];
        "medicine_company_ids"?: string[] | null;
        "generate_ai_draft"?: boolean;
    };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {children}
        </p>
    );
}

function SpecializationsInput({
    value,
    onChange,
}: {
    value: string[];
    onChange: (next: string[]) => void;
}) {
    const [input, setInput] = useState("");

    const addTag = (raw: string) => {
        const tag = raw.trim();
        if (!tag || value.includes(tag)) return;
        onChange([...value, tag]);
        setInput("");
    };

    const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

    return (
        <div className="flex flex-wrap gap-2 rounded-xl border px-2 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
            {value.map((tag) => (
                <span
                    key={tag}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove ${tag}`}
                        className="text-emerald-500 hover:text-emerald-700"
                    >
                        <XIcon className="size-3" />
                    </button>
                </span>
            ))}

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(input);
                    }
                    if (e.key === "Backspace" && !input && value.length) {
                        removeTag(value[value.length - 1]);
                    }
                }}
                placeholder="Type and press Enter"
                className="min-w-[120px] flex-1 bg-transparent text-base outline-none sm:text-sm"
            />

            <Button type="button" size="sm" onClick={() => addTag(input)}>
                + Add
            </Button>
        </div>
    );
}

export function ProfileForm({ clinicianData }: ProfileFormProps) {

    const [isLoading, setIsLoading] = useState(false)
    const userId = useAuthStore((state) => state.userId)
    const { storeClinicianInfo } = useAuthStore();
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: clinicianData?.first_name || "",
            lastName: clinicianData?.last_name || "",
            bmdcNo: clinicianData?.bmdc_no || "",
            qualification: clinicianData?.qualification || "",
            specializations: clinicianData?.specializations || [],
            defaultGeneration: clinicianData?.generate_ai_draft ?? true,
        },
    })

    const isDirty = form.formState.isDirty

    async function onSubmit(data: FormValues) {
        try {
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                bmdc_no: data.bmdcNo,
                qualification: data.qualification,
                specializations: data.specializations,
                generate_ai_draft: data.defaultGeneration,
            }

            setIsLoading(true)
            await api.put(`/clinician/${userId}`, payload)
            storeClinicianInfo({
                bmdcNo: payload.bmdc_no,
                firstName: payload.first_name,
                lastName: payload.last_name,
                qualification: payload.qualification,
                specializations: payload.specializations,
                generate_ai_draft: payload.generate_ai_draft,
            })
            queryClient.invalidateQueries({ queryKey: ["clinician", userId] })
            form.reset(data) // clears the dirty state and disables Save until the next edit
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error(error)
            toast.error(error instanceof AxiosError ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardContent>
                <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-8">
                        {/* Personal */}
                        <div className="flex flex-col gap-4">
                            <SectionTitle>Personal</SectionTitle>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Controller
                                    name="firstName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>First name</FieldLabel>
                                            <Input {...field} placeholder="John" />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="lastName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>Last name</FieldLabel>
                                            <Input {...field} placeholder="Doe" />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Professional */}
                        <div className="flex flex-col gap-4">
                            <SectionTitle>Professional</SectionTitle>
                            <Controller
                                name="bmdcNo"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>BMDC registration no.</FieldLabel>
                                        <Input {...field} placeholder="123456" inputMode="numeric" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="qualification"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Qualification</FieldLabel>
                                        <Input {...field} placeholder="MBBS, FCPS" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="specializations"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Specializations</FieldLabel>
                                        <SpecializationsInput
                                            value={field.value ?? []}
                                            onChange={field.onChange}
                                        />
                                        <FieldDescription>
                                            Press Enter or click + to add a specialization.
                                        </FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Preferences */}
                        <div className="flex flex-col gap-4">
                            <SectionTitle>Preferences</SectionTitle>
                            <Controller
                                name="defaultGeneration"
                                control={form.control}
                                render={({ field }) => (
                                    <Field>
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <FieldLabel>Auto-generate prescription draft</FieldLabel>
                                                <FieldDescription>
                                                    When on, ARIS drafts the prescription automatically after each recording.
                                                </FieldDescription>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={field.value}
                                                onClick={() => field.onChange(!field.value)}
                                                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${field.value ? "bg-emerald-500" : "bg-gray-300"}`}
                                            >
                                                <div
                                                    className={`size-4 rounded-full bg-white shadow-md transition ${field.value ? "translate-x-5" : "translate-x-0"}`}
                                                />
                                            </button>
                                        </div>
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={!isDirty || isLoading}
                    onClick={() => form.reset()}
                >
                    Reset
                </Button>
                <Button type="submit" form="form-rhf-input" disabled={!isDirty} isLoading={isLoading}>
                    Save changes
                </Button>
            </CardFooter>
        </Card>
    )
}
