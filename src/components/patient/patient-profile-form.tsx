"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { AxiosError } from "axios"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from "@/lib/axios"
import { useAuthStore } from "@/stores/auth-store"
import type { PatientInfoType } from "@/types/patient"

const formSchema = z.object({
    firstName:   z.string().trim().min(1, "First name is required"),
    lastName:    z.string().trim().min(1, "Last name is required"),
    dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
    sex:         z.enum(["male", "female", "non_binary"]).optional(),
})

interface PatientProfileFormProps {
    patientData: PatientInfoType;
}

export function PatientProfileForm({ patientData }: PatientProfileFormProps) {

    const [isLoading, setIsLoading] = useState(false)
    const userId = useAuthStore((state) => state.userId)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName:   patientData?.first_name || "",
            lastName:    patientData?.last_name || "",
            dateOfBirth: patientData?.date_of_birth || "",
            sex:         patientData?.sex,
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            await api.put(`/patient/${userId}`, {
                first_name:    data.firstName,
                last_name:     data.lastName,
                date_of_birth: data.dateOfBirth,
                sex:           data.sex,
            })
            await queryClient.invalidateQueries({ queryKey: ["patient", userId] })
            toast.success("Profile updated successfully")
            navigate({ to: "/patient/profile" })
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
                <form id="patient-profile-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="gap-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Controller
                                name="firstName"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>First name</FieldLabel>
                                        <Input {...field} placeholder="John" />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
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
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Controller
                                name="dateOfBirth"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Date of birth</FieldLabel>
                                        <Input {...field} type="date" />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="sex"
                                control={form.control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Sex</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select sex" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="non_binary">Non-binary</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                    onClick={() => navigate({ to: "/patient/profile" })}
                >
                    Cancel
                </Button>
                <Button type="submit" form="patient-profile-form" isLoading={isLoading}>
                    Save
                </Button>
            </CardFooter>
        </Card>
    )
}
