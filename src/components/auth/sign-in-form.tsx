import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { handleError } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import NumberGroupInputMemo from "../dashboard/number-group-input";


export default function SignInForm() {

    const navigate = useNavigate();
    const { sendOtp, doesUserExist } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill(" ")));
    const [isValidPhone, setIsValidPhone] = useState(false);

    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handlePhoneComplete = useCallback((isComplete: boolean) => {
        setIsValidPhone(isComplete);
        if (isComplete) {
            submitButtonRef.current?.focus();
        }
    }, [])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const doesExist = await doesUserExist("+88".concat(phoneNumber.join("").trim()));
            await sendOtp("+88".concat(phoneNumber.join("").trim()));
            toast.success("OTP sent successfully!");
            navigate({ to: "/enter-otp", search: { exists: doesExist ? 1 : 0 } });
        } catch (error) {
            handleError(error, "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <NumberGroupInputMemo
                numberInput={phoneNumber}
                setNumberInput={setPhoneNumber}
                onComplete={handlePhoneComplete}
            />
            <Button type="submit" isLoading={isLoading} className="w-24" ref={submitButtonRef} disabled={!isValidPhone}>
                Send OTP
            </Button>
        </form>
    )
}