import { useRef, useState, type BaseSyntheticEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { InputFieldStep, MultiStepFormSteps, RadioFieldStep } from '@/types/shared'
import { InputField, RadioField } from './form-step'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

interface MultiStepFormProps<T extends FieldValues> {
    title?: string;
    className?: string;
    steps: MultiStepFormSteps<T>;
    onSubmit: (values: T) => Promise<void>;
    form: UseFormReturn<T>;
}

export default function MultiStepForm<T extends FieldValues>({ title, className, steps, onSubmit, form }: MultiStepFormProps<T>) {

    const { control, trigger, setFocus, handleSubmit, formState } = form;

    const [step, setStep] = useState(0);

    const prevStepRef = useRef(-1)


    const next = async (e: BaseSyntheticEvent) => {
        e.preventDefault();

        const field = steps[step].id;
        const isValid = await trigger(field);
        if (!isValid) {
            setFocus(field);
            return;
        }

        if (step < steps.length - 1) {
            prevStepRef.current = step;
            setStep(step + 1);
        }
    }

    const validationMiddleWare = async () => {
        const field = steps[step].id;
        if (formState.errors[field]) await
            trigger(field);
    }

    const prev = () => {
        if (step > 0) {
            prevStepRef.current = step;
            setStep(step - 1);
        }
    }

    const getDirection = () => {
        if (prevStepRef.current < step) return 1;
        if (prevStepRef.current > step) return -1;
        return 1;
    }

    const renderStepComponent = (stepDef: MultiStepFormSteps<T>[number]) => {
        switch (stepDef.def) {
            case "input":
                return <InputField {...(stepDef as InputFieldStep<T>)} control={control} validationMiddleWare={validationMiddleWare} />;
            case "radio":
                return <RadioField {...(stepDef as RadioFieldStep<T>)} control={control} validationMiddleWare={validationMiddleWare} />;
            default:
                return null;
        }
    }

    const handleSubmitWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        for (let i = 0; i < steps.length; i++) {
            const field = steps[i].id;
            const valid = await trigger(field);

            if (!valid) {
                setStep(i);
                setFocus(field);
                return;
            }
        }

        await handleSubmit(onSubmit)();

        setStep(0);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            if (step < steps.length - 1) {
                next(e);
            } else {
                if (formState.isSubmitting) return;
                handleSubmitWrapper(e);
            }
        } else if (e.key.toLowerCase() === "p" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            prev();
        }

    }

    return (
        <form id="form-rhf-demo" onSubmit={handleSubmitWrapper} onKeyDown={handleKeyDown}>
            <Card className={cn("w-xl mx-auto py-10 flex flex-col justify-between items-center h-[400px]", className)}>
                {title && <CardHeader className='w-full'>
                    <CardTitle className="text-center">{title}</CardTitle>
                </CardHeader>}

                {/* Progress Bar */}
                <div className="px-6 pb-4 w-full">
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />
                    </div>

                </div>

                <CardContent className="w-full flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0.5, x: getDirection() * 20 }}
                            animate={{ opacity: 1.5, x: 0 }}
                            exit={{ opacity: 0.5 }}
                            transition={{ opacity: { duration: 0.1 }, x: { duration: 0.2 } }}
                            className="space-y-6"
                        >
                            {renderStepComponent(steps[step])}
                        </motion.div>
                    </AnimatePresence>


                </CardContent >

                <CardFooter className="flex justify-between mt-6 w-full">
                    <Button variant="outline" onClick={prev} disabled={step === 0} shortCutKey='⌘ P'>
                        Previous
                    </Button>

                    {step < steps.length - 1 ? (
                        <Button type="button" onClick={next} shortCutKey={"⏎"}>Next</Button>
                    ) : (
                        <Button shortCutKey={"⏎"} type="submit" isLoading={formState.isSubmitting}>Submit</Button>
                    )}
                </CardFooter>
            </Card >
        </form>

    )
}