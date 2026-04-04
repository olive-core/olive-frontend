"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

const formSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    bmdcNo: z.string().regex(/^\d+$/, "BMDC number must contain only numbers"),
    qualification: z.string(),
    specializations: z.array(z.string()).optional(),
})

export function ProfileForm() {

    const [isLoading, setIsLoading] = useState(false)
    const clinician = useAuthStore((state) => state.clinician)
    const userId = useAuthStore((state) => state.userId)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: clinician?.firstName || "",
            lastName: clinician?.lastName || "",
            bmdcNo: clinician?.bmdcNo || "",
            qualification: clinician?.qualification || "",
            specializations: clinician?.specializations || [],
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {

        try {
            setIsLoading(true)

            await api.put(`/clinician/${userId}`, {
                bmdc_no: data.bmdcNo,
                qualification: data.qualification,
                specializations: data.specializations,
            })
        } catch (error) {
            console.error(error)
            toast.error(error instanceof AxiosError ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                    Update your profile information below.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {/* First Name */}
                        <Controller
                            name="firstName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>First Name</FieldLabel>
                                    <Input {...field} placeholder="John" />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Last Name */}
                        <Controller
                            name="lastName"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Last Name</FieldLabel>
                                    <Input {...field} placeholder="Doe" />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* BMDC No */}
                        <Controller
                            name="bmdcNo"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>BMDC Number</FieldLabel>
                                    <Input {...field} placeholder="123456" />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Qualification */}
                        <Controller
                            name="qualification"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Qualification</FieldLabel>
                                    <Input {...field} placeholder="MBBS, FCPS" />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Specializations (tag input UX) */}
                        <Controller
                            name="specializations"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                const [input, setInput] = useState("");

                                const addTag = (value: string) => {
                                    const v = value.trim();
                                    if (!v) return;
                                    if (field.value?.includes(v)) return;
                                    field.onChange([...field.value ?? [], v]);
                                    setInput("");
                                };

                                const removeTag = (tag: string) => {
                                    field.onChange(field.value?.filter((t: string) => t !== tag));
                                };

                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Specializations</FieldLabel>

                                        <div className="flex flex-wrap gap-2 border rounded-xl px-2 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
                                            {field.value?.map((tag: string) => (
                                                <div
                                                    key={tag}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="text-emerald-500 hover:text-emerald-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}

                                            <input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addTag(input);
                                                    }
                                                    if (e.key === "Backspace" && !input) {
                                                        removeTag(field.value?.[field.value.length - 1] ?? "");
                                                    }
                                                }}
                                                placeholder="Type and press Enter"
                                                className="flex-1 min-w-[120px] outline-none text-sm"
                                            />

                                            <Button
                                                type="button"
                                                onClick={() => addTag(input)}
                                                size="sm"
                                            >
                                                + Add
                                            </Button>
                                        </div>

                                        <FieldDescription>
                                            Press Enter or click + to add specializations
                                        </FieldDescription>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter>
                <Field orientation="horizontal">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button type="submit" form="form-rhf-input" isLoading={isLoading}>
                        Save
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}