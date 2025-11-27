import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import NumberGroupInput from "../dashboard/number-group-input";
import { Button } from "../ui/button";
import { RefreshCwIcon } from "lucide-react";
import { handleError } from "@/lib/utils";

const OTP_LENGTH = 6;
const RESEND_OTP_TIME = 30; // seconds

export default function EnterOtpForm() {

    const navigate = useNavigate();
    const { verifyOtp, phoneNumber, sendOtp } = useAuthStore();
    const [searchParams] = useSearchParams();


    const [isLoading, setIsLoading] = useState(false);

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(" "));
    const [isValidOtp, setIsValidOtp] = useState(false);
    const [resetOtp, setResetOtp] = useState(Math.random());

    const [resendTimer, setResendTimer] = useState(RESEND_OTP_TIME);

    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {

        timerRef.current = setInterval(() => {
            setResendTimer(prev => prev >= 1 ? prev - 1 : 0);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [])

    const handleOtpComplete = (isComplete: boolean) => {
        setIsValidOtp(isComplete);
        if (isComplete) {
            submitButtonRef.current?.focus();
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOtp(phoneNumber, otp.join("").trim());
            toast.success("OTP verified successfully!");
            if (searchParams.get("exists") === "true") {
                navigate("/dashboard");
            } else {
                navigate("/auth/setup-profile");
            }
        } catch (error) {
            handleError(error, "Failed to verify OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function resendOtp(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (resendTimer > 0) return;
        setIsLoading(true);
        try {
            toast.success("OTP resent successfully!");
            setResendTimer(RESEND_OTP_TIME);
            await sendOtp(phoneNumber);
            setResetOtp(Math.random());
        } catch (error) {
            handleError(error, "Failed to resend OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <NumberGroupInput
                numberInput={otp}
                setNumberInput={setOtp}
                onComplete={handleOtpComplete}
                inputLength={OTP_LENGTH}
                secondGroupStartIndex={-1}
                dynamicValuesStartIndex={0}
                key={resetOtp}
            />
            <div className="flex items-center justify-between">
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-24"
                    ref={submitButtonRef}
                    disabled={!isValidOtp}
                    onClick={onSubmit}
                >
                    Verify
                </Button>
                <div className="flex items-center gap-px">
                    <Button
                        size="icon"
                        variant="ghost"
                        disabled={resendTimer > 0}
                        onClick={resendOtp}
                        className="disabled:pointer-none"
                    >
                        <RefreshCwIcon className="inline-block size-4 cursor-pointer text-gray-600 hover:text-gray-800" />
                    </Button>
                    {resendTimer > 0 && <pre className="text-sm text-rose-600">{resendTimer}s</pre>}
                </div>
            </div>
        </form>
    )
}