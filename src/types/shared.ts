import type React from "react";
import type { Path, FieldValues } from "react-hook-form";

export type ClinicianType = {
    id?: string;
    bmdcNo: string;
    qualification?: string;
    specializations?: string[];
    firstName?: string;
    lastName?: string;
    generate_ai_draft?: boolean;
}

type StepDefTypes = 'input' | 'radio' | 'tagInput';

export type BaseFieldStep<T extends FieldValues> = {
    id: Path<T>;
    def: StepDefTypes;
    label: string;
}

export type InputFieldStep<T extends FieldValues> = BaseFieldStep<T> & {
    type: string;
    placeholder?: string;
}

export type RadioFieldStep<T extends FieldValues> = BaseFieldStep<T> & {
    options: { value: string; label: string, icon?: React.ReactNode, description?: string }[];
    orientation?: 'horizontal' | 'vertical';
}

export type TagInputFieldStep<T extends FieldValues> = BaseFieldStep<T> & {
    placeholder?: string;
}

type FormStep<T extends FieldValues> =
    | InputFieldStep<T>
    | RadioFieldStep<T>
    | TagInputFieldStep<T>;

export type MultiStepFormSteps<T extends FieldValues> = FormStep<T>[];