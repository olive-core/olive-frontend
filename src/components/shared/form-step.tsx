import type { InputFieldStep, RadioFieldStep } from "@/types/shared";
import { Input } from "../ui/input";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import { Field, FieldContent, FieldError, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "../ui/field";
import { RadioGroupItem, RadioGroup } from "../ui/radio-group";
import { cn } from "@/lib/utils";

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