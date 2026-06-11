import type { InputFieldStep, RadioFieldStep, TagInputFieldStep, TermsAcceptanceFieldStep } from "@/types/shared";
import { Input } from "../ui/input";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import { Field, FieldContent, FieldError, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "../ui/field";
import { RadioGroupItem, RadioGroup } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import TermsAndConditions from "./terms-and-conditions";

interface BaseFieldProps<T extends FieldValues> {
    control: Control<T>;
    validationMiddleWare?: () => Promise<void>;
}

const fieldLabelClasses = "text-center opacity-60 block";

export function InputField<T extends FieldValues>({ id, control, placeholder, label, validationMiddleWare }: BaseFieldProps<T> & InputFieldStep<T>) {
    return (

        <Controller
            name={id}
            control={control}
            render={({ field, fieldState }) => {

                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e);
                    if (validationMiddleWare) {
                        validationMiddleWare();
                    }
                }

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id} className={fieldLabelClasses}>
                            {label}
                        </FieldLabel>
                        <Input
                            {...field}
                            id={id}
                            aria-invalid={fieldState.invalid}
                            placeholder={placeholder}
                            autoComplete="off"
                            autoFocus
                            onChange={handleChange}
                        />
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                )
            }}
        />
    )
}

export function TagInputField<T extends FieldValues>({ id, control, label, placeholder, validationMiddleWare }: BaseFieldProps<T> & TagInputFieldStep<T>) {
    return (
        <Controller
            name={id}
            control={control}
            render={({ field, fieldState }) => {
                const [inputValue, setInputValue] = useState("");

                const addTag = (value: string) => {
                    const trimmed = value.trim();
                    if (!trimmed || field.value?.includes(trimmed)) return;
                    field.onChange([...(field.value ?? []), trimmed]);
                    setInputValue("");
                    if (validationMiddleWare) validationMiddleWare();
                };

                const removeTag = (tag: string) => {
                    field.onChange(field.value?.filter((t: string) => t !== tag));
                };

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id} className={fieldLabelClasses}>{label}</FieldLabel>
                        <div className="flex flex-wrap gap-2 border rounded-xl px-2 py-2 focus-within:ring-1 focus-within:ring-ring min-h-[36px]">
                            {field.value?.map((tag: string) => (
                                <div key={tag} className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg">
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
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addTag(inputValue);
                                    }
                                    if (e.key === "Backspace" && !inputValue) {
                                        removeTag(field.value?.[field.value.length - 1] ?? "");
                                    }
                                }}
                                placeholder={placeholder ?? "Type and press Enter"}
                                className="flex-1 min-w-[120px] outline-none text-sm"
                            />
                            <Button type="button" size="sm" onClick={() => addTag(inputValue)}>
                                + Add
                            </Button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                );
            }}
        />
    );
}

export function TermsAcceptanceField<T extends FieldValues>({ id, control }: BaseFieldProps<T> & TermsAcceptanceFieldStep<T>) {
    return (
        <Controller
            name={id}
            control={control}
            render={({ field, fieldState }) => (
                <div className="space-y-3">
                    <TermsAndConditions />

                    <label
                        htmlFor={id}
                        data-invalid={fieldState.invalid}
                        className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer select-none transition-colors hover:bg-muted/40 data-[invalid=true]:border-destructive"
                    >
                        <Checkbox
                            id={id}
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            aria-invalid={fieldState.invalid}
                        />
                        <span className="text-sm leading-snug">
                            I have read and agree to the <span className="font-medium">Terms and Conditions</span>.
                        </span>
                    </label>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </div>
            )}
        />
    );
}

export function RadioField<T extends FieldValues>({ id, label, control, options, orientation = "horizontal" }: BaseFieldProps<T> & RadioFieldStep<T>) {
    return (
        <Controller
            name={id}
            control={control}
            render={({ field, fieldState }) => {


                return (
                    <FieldSet data-invalid={fieldState.invalid} autoFocus>
                        <FieldLegend className={fieldLabelClasses}>{label}</FieldLegend>
                        <RadioGroup
                            name={id}
                            value={field.value}
                            onValueChange={field.onChange}
                            aria-invalid={fieldState.invalid}
                            className={cn("flex", orientation === "horizontal" ? "flex-row gap-4" : "flex-col gap-3")}
                        >
                            {options.map((option) => (
                                <FieldLabel
                                    key={option.value}
                                    htmlFor={`radiogroup-${option.value}`}
                                >
                                    <Field
                                        orientation={"horizontal"}
                                        data-invalid={fieldState.invalid}
                                    >
                                        <FieldContent className="flex flex-row items-center">
                                            {option.icon && option.icon}
                                            <FieldTitle>{option.label}</FieldTitle>

                                        </FieldContent>
                                        <RadioGroupItem
                                            autoFocus={field.value === option.value}
                                            value={option.value}
                                            id={`radiogroup-${option.value}`}
                                            aria-invalid={fieldState.invalid}
                                        />
                                    </Field>
                                </FieldLabel>
                            ))}
                        </RadioGroup>
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </FieldSet>
                )
            }
            }
        />
    )
}