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
import { specializationsFromDesignation, type HeaderConfigApi } from "@/lib/header-config"
import UnsavedChangesDialog from "@/components/dashboard/practice-account/unsaved-changes-dialog"

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    bmdcNo: z.string().trim().min(1, "BMDC number is required").regex(/^[A-Za-z0-9-]+$/, "Enter a valid BMDC number (e.g. A-53127)"),
    qualification: z.string().trim(),
    designation: z.string().trim(),
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
        "header_config"?: HeaderConfigApi | null;
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
            qualification: clinicianData.qualification || "",
            designation: clinicianData.header_config?.designation?.trim() || clinicianData.specializations?.join(", ") || "",
        },
    })

    const isDirty = form.formState.isDirty

    async function onSubmit(data: FormValues) {
        try {
            const payload = {
                name: data.name,
                bmdc_no: data.bmdcNo,
                qualification: data.qualification,
                specializations: specializationsFromDesignation(data.designation),
                header_config: { ...clinicianData.header_config, designation: data.designation },
            }

            setIsLoading(true)
            await api.put(`/clinician/${userId}`, payload)
            storeClinicianInfo({
                bmdcNo: payload.bmdc_no,
                name: payload.name,
                qualification: payload.qualification,
                specializations: payload.specializations,
            })
            queryClient.invalidateQueries({ queryKey: ["clinician", userId] })
            queryClient.invalidateQueries({ queryKey: ["clinician-profile", userId] })
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
        <Card className="w-full border-slate-200/80 shadow-none">
            <UnsavedChangesDialog dirty={isDirty} />
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
                                        <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                                        <Input className="h-11 sm:h-9" id="profile-name" {...field} placeholder="Full name" />
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
                                        <FieldLabel htmlFor="profile-bmdc">BMDC registration no.</FieldLabel>
                                        <Input className="h-11 sm:h-9" id="profile-bmdc" {...field} placeholder="A-53127" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            {(['qualification', 'designation'] as const).map((name) => (
                                <Controller key={name} name={name} control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={name}>{name === 'qualification' ? 'Qualifications' : 'Designation / specialization'}</FieldLabel>
                                        <textarea id={name} {...field} rows={2} className="min-h-20 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )} />
                            ))}
                            <FieldDescription>
                                These details also appear on new prescription pads. Existing finalized prescriptions keep their original details.{' '}
                                <Link to="/doctor/prescription-header" search={{ section: 'doctor' }} className="font-medium text-emerald-700 underline underline-offset-4">View prescription pad</Link>
                            </FieldDescription>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 sm:min-h-9"
                    disabled={!isDirty || isLoading}
                    onClick={() => form.reset()}
                >
                    Reset
                </Button>
                <Button className="min-h-11 sm:min-h-9" type="submit" form="form-rhf-input" disabled={!isDirty} isLoading={isLoading}>
                    Save changes
                </Button>
            </CardFooter>
        </Card>
    )
}
