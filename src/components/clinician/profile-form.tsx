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
import { Link } from "@tanstack/react-router"

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    bmdcNo: z.string().trim().min(1, "BMDC number is required").regex(/^[A-Za-z0-9-]+$/, "Enter a valid BMDC number (e.g. A-53127)"),
    defaultGeneration: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProfileFormProps {
    clinicianData: {
        "user_id": string;
        "name": string;
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

export function ProfileForm({ clinicianData }: ProfileFormProps) {

    const [isLoading, setIsLoading] = useState(false)
    const userId = useAuthStore((state) => state.userId)
    const { storeClinicianInfo } = useAuthStore();
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: clinicianData?.name || "",
            bmdcNo: clinicianData?.bmdc_no || "",
            defaultGeneration: clinicianData?.generate_ai_draft ?? true,
        },
    })

    const isDirty = form.formState.isDirty

    async function onSubmit(data: FormValues) {
        try {
            const payload = {
                name: data.name,
                bmdc_no: data.bmdcNo,
                generate_ai_draft: data.defaultGeneration,
            }

            setIsLoading(true)
            await api.put(`/clinician/${userId}`, payload)
            storeClinicianInfo({
                bmdcNo: payload.bmdc_no,
                name: payload.name,
                qualification: clinicianData?.qualification,
                specializations: clinicianData?.specializations,
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
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Name</FieldLabel>
                                        <Input {...field} placeholder="Full name" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
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
                                        <Input {...field} placeholder="A-53127" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <FieldDescription>
                                Qualification and designation / specialization are edited on your{" "}
                                <Link
                                    to="/doctor/prescription-header"
                                    search={{ tab: "doctor" }}
                                    className="font-medium text-emerald-600 underline-offset-2 hover:underline"
                                >
                                    Prescription pad
                                </Link>
                                , so your profile and printed pads always match.
                            </FieldDescription>
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
