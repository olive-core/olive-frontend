import { cn } from "@/lib/utils";
import { RotateCcwIcon } from "lucide-react";
import { Fragment, memo, useEffect, useRef } from "react";
import { Button } from "../ui/button";

interface NumberGroupInputProps {
    numberInput: string[];
    setNumberInput: React.Dispatch<React.SetStateAction<string[]>>;
    onComplete?: (isComplete: boolean) => void; // wrap in useCallback when passing from parent
    inputLength?: number;
    secondGroupStartIndex?: number;
    dynamicValuesStartIndex?: number;
    groupLabel?: string;
    autoComplete?: string;
}

const isDigit = (char: string) => char >= "0" && char <= "9";

// Empty cells render this invisible non-breaking space so that pressing backspace always has
// a character to delete. Mobile keyboards (Android Gboard / iOS) fire no event on a truly empty
// field, which is what made backspace get stuck; the sentinel guarantees an onChange every time.
// It is stripped before anything is stored, so it never becomes data.
const SENTINEL = " ";

/**
 * Segmented number input (phone / OTP). Each editable box is its own <input>, so cells are
 * independent: clicking a box edits only that cell and deleting clears it in place without
 * shifting the others. All edits flow through onChange (never keydown) to stay robust on mobile.
 */
function NumberGroupInput({
    numberInput,
    setNumberInput,
    onComplete = () => { },
    inputLength = 11,
    secondGroupStartIndex = 4,
    dynamicValuesStartIndex = 2,
    groupLabel = "Phone number",
    autoComplete,
}: NumberGroupInputProps) {

    const prefixLength = dynamicValuesStartIndex;        // count of fixed, non-editable cells (e.g. "01")
    const capacity = inputLength - prefixLength;          // number of editable cells
    const cellRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        onComplete(numberInput.length === inputLength && numberInput.every(isDigit));
    }, [numberInput, inputLength, onComplete]);

    const writeCell = (arrayIndex: number, value: string) => {
        setNumberInput((prev) => {
            const next = Array.from({ length: inputLength }, (_, i) => prev[i] ?? "");
            next[arrayIndex] = value;
            return next;
        });
    };

    const focusCell = (editableIndex: number) => {
        const cell = cellRefs.current[editableIndex];
        if (!cell) return;
        cell.focus();
        cell.select();
        // The controlled value updates only after this handler returns, so re-select on the next
        // frame to keep the (possibly just-changed) content selected — backspace needs it selected.
        requestAnimationFrame(() => {
            if (cellRefs.current[editableIndex] === document.activeElement) {
                cellRefs.current[editableIndex]?.select();
            }
        });
    };

    const handleType = (editableIndex: number, digit: string) => {
        writeCell(prefixLength + editableIndex, digit);
        if (editableIndex + 1 < capacity) focusCell(editableIndex + 1);
    };

    const handleDelete = (editableIndex: number) => {
        if (isDigit(numberInput[prefixLength + editableIndex] ?? "")) {
            writeCell(prefixLength + editableIndex, "");
            focusCell(editableIndex); // stay here so the next backspace continues from this box
        } else if (editableIndex > 0) {
            writeCell(prefixLength + editableIndex - 1, "");
            focusCell(editableIndex - 1); // empty box: walk back and clear the previous one
        }
    };

    // Paste / SMS autofill: drop consecutive digits into cells from the given start.
    const distribute = (fromEditableIndex: number, digits: string) => {
        setNumberInput((prev) => {
            const next = Array.from({ length: inputLength }, (_, i) => prev[i] ?? "");
            for (let k = 0; k < digits.length && fromEditableIndex + k < capacity; k++) {
                next[prefixLength + fromEditableIndex + k] = digits[k];
            }
            return next;
        });
        focusCell(Math.min(fromEditableIndex + digits.length, capacity - 1));
    };

    const handleChange = (editableIndex: number, rawValue: string) => {
        const digits = rawValue.replace(/\D/g, "");
        if (digits.length === 0) return handleDelete(editableIndex);
        if (digits.length >= 2) {
            // A full-length code always fills from the start; a shorter paste drops in here.
            return distribute(digits.length >= capacity ? 0 : editableIndex, digits);
        }
        handleType(editableIndex, digits);
    };

    const handleKeyDown = (editableIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowLeft" && editableIndex > 0) {
            e.preventDefault();
            focusCell(editableIndex - 1);
        } else if (e.key === "ArrowRight" && editableIndex + 1 < capacity) {
            e.preventDefault();
            focusCell(editableIndex + 1);
        }
    };

    const handleReset = () => {
        setNumberInput((prev) => prev.map((char, i) => (i < prefixLength ? char : "")));
        focusCell(0);
    };

    // h-11 touch target; flex-1 fills the row on phone; sm:max-w-12 caps each box at 48px so every
    // screen (login / welcome / OTP) shows the same size regardless of its container width.
    const cellBase =
        "h-11 min-w-0 flex-1 rounded-lg border bg-white text-center text-base font-medium sm:h-12 sm:max-w-12";

    return (
        <div className="flex w-full items-center justify-center gap-1 sm:gap-1.5">
            {Array.from({ length: inputLength }).map((_, index) => {
                const isPrefix = index < prefixLength;
                const editableIndex = index - prefixLength;
                const char = numberInput[index] ?? "";

                return (
                    <Fragment key={index}>
                        {isPrefix ? (
                            <div
                                aria-hidden
                                className={cn(cellBase, "flex items-center justify-center border-gray-200 bg-slate-100 text-slate-400")}
                            >
                                {char}
                            </div>
                        ) : (
                            <input
                                ref={(el) => { cellRefs.current[editableIndex] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                size={1} // lets the input shrink in flexbox instead of overflowing the screen
                                autoComplete={autoComplete}
                                aria-label={`${groupLabel} — digit ${editableIndex + 1}`}
                                value={char || SENTINEL}
                                onChange={(e) => handleChange(editableIndex, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(editableIndex, e)}
                                onFocus={(e) => e.target.select()}
                                className={cn(
                                    cellBase,
                                    "border-gray-300 text-gray-900 caret-primary outline-none",
                                    "focus:border-primary focus:ring-2 focus:ring-primary",
                                )}
                            />
                        )}

                        {index === secondGroupStartIndex && (
                            <span aria-hidden className="hidden shrink-0 px-0.5 text-gray-400 sm:inline">-</span>
                        )}
                    </Fragment>
                );
            })}

            <Button
                type="button"
                aria-label="Clear"
                onClick={handleReset}
                className="ml-0.5 h-11 w-10 shrink-0 rounded-lg border border-rose-200 bg-rose-100 p-0 text-rose-500 hover:bg-rose-200 sm:ml-1 sm:h-12"
            >
                <RotateCcwIcon className="size-5" />
            </Button>
        </div>
    );
}

const NumberGroupInputMemo = memo(NumberGroupInput);
export default NumberGroupInputMemo;
