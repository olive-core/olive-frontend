import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "react-router";
import NumberGroupInput from "../dashboard/number-group-input";
import { handleError } from "@/lib/utils";


export default function SignInForm() {

    const navigate = useNavigate();
    const { sendOtp, doesUserExist } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill(" ")));
    const [isValidPhone, setIsValidPhone] = useState(false);

    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handlePhoneComplete = (isComplete: boolean) => {
        setIsValidPhone(isComplete);
        if (isComplete) {
            submitButtonRef.current?.focus();
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const doesExist = await doesUserExist("+88".concat(phoneNumber.join("").trim()));
            await sendOtp("+88".concat(phoneNumber.join("").trim()));
            toast.success("OTP sent successfully!");
            navigate(`/enter-otp?exists=${doesExist.toString()}`);
        } catch (error) {
            handleError(error, "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <NumberGroupInput
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