import { cn } from "@/lib/utils";
import { RotateCcwIcon } from "lucide-react";
import { createRef, Fragment, memo, useEffect } from "react"
import { Button } from "../ui/button";

interface PhoneInputProps {
    numberInput: string[];
    setNumberInput: React.Dispatch<React.SetStateAction<string[]>>;
    onComplete?: (isComplete: boolean) => void; // make sure to make it useCallback when passing from parent
    inputLength?: number;
    secondGroupStartIndex?: number;
    dynamicValuesStartIndex?: number;
}

function NumberGroupInput({
    numberInput,
    setNumberInput,
    onComplete = () => { },
    inputLength = 11,
    secondGroupStartIndex = 4,
    dynamicValuesStartIndex = 2
}: PhoneInputProps) {

    const inputRefs = Array.from({ length: inputLength }, () => createRef<HTMLInputElement>());

    const handleReset = () => {
        const newNumber = [...numberInput];
        for (let i = dynamicValuesStartIndex; i < numberInput.length; i++) {
            newNumber[i] = " "
        }
        setNumberInput(newNumber);

        inputRefs[dynamicValuesStartIndex].current?.focus();
    }

    useEffect(() => {
        const isComplete = numberInput.every(char => char >= "0" && char <= "9");
        onComplete(isComplete);
    }, [numberInput, onComplete, inputRefs]);

    const handleFocusPrev = (index: number) => {
        if (index > dynamicValuesStartIndex) {
            inputRefs[index - 1].current?.focus();
        }
    }

    const handleFocusNext = (index: number) => {
        if (index < inputLength - 1) {
            inputRefs[index + 1].current?.focus();
        } else {
            const newIndex = numberInput.findIndex((char, i) => i >= dynamicValuesStartIndex && !(char >= "0" && char <= "9"));
            if (newIndex !== -1) {
                inputRefs[newIndex].current?.focus();
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {

        if (e.key >= "0" && e.key <= "9") {
            const newNumber = [...numberInput];
            newNumber[index] = e.key;
            setNumberInput(newNumber);
            handleFocusNext(index);
            e.preventDefault();
            return;
        }

        switch (e.key) {
            case "Backspace":
                if (index < dynamicValuesStartIndex) return;
                setNumberInput((prev: string[]) => {
                    const newNumber = [...prev];
                    newNumber[index] = " ";
                    return newNumber;
                });
                break;
            case "ArrowLeft":
                if (index > dynamicValuesStartIndex) {
                    handleFocusPrev(index);
                }
                break;
            case "ArrowRight":
                if (index < inputLength - 1) {
                    handleFocusNext(index);
                }
                break;
            default:
                break;
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim();
        const digits = pasteData.replace(/\D/g, "").split("");

        const newNumber = [...numberInput];
        for (let i = 0; i < digits.length; i++) {
            newNumber[index + i] = digits[i];
            if (index + i + 1 >= inputLength) break;

            handleFocusNext(index + i);
        }
        setNumberInput(newNumber);
    }


    return (
        <div className="mx-auto overflow-x-auto max-w-full pb-1">
            <div className="flex items-center w-max mx-auto">
                {Array.from({ length: inputLength }).map((_, index) => (
                    <Fragment key={index}>
                        <input
                            ref={inputRefs[index]}
                            type="text"
                            value={numberInput[index]}
                            maxLength={1}
                            className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 text-center text-sm sm:text-base border border-gray-300 focus:outline-primary disabled:bg-slate-200",
                                (index === secondGroupStartIndex || index === inputLength - 1) ? "border-r" : "border-r-0",
                                index === inputLength - 1 ? "rounded-r-lg" : "rounded-r-none",
                                index === 0 ? "rounded-l-lg" : "rounded-l-none"
                            )}
                            disabled={index < dynamicValuesStartIndex}
                            autoFocus={index === dynamicValuesStartIndex}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onChange={() => { }}
                            onPaste={(e) => handlePaste(e, index)}
                        />

                        {index === secondGroupStartIndex ? <span className="mx-1 sm:mx-2">-</span> : null}

                        {index === inputLength - 1 && (
                            <Button size="icon" className="ml-2 sm:ml-3 w-8 h-8 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center bg-rose-100 text-rose-500 border-rose-200 hover:bg-rose-200 p-0" onClick={handleReset}>
                                <RotateCcwIcon className="size-4 sm:size-5" />
                            </Button>
                        )}

                    </Fragment>
                ))}
            </div>
        </div>
    )
}

const NumberGroupInputMemo = memo(NumberGroupInput);
export default NumberGroupInputMemo;