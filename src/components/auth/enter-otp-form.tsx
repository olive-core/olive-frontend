import { useAuthStore } from "@/stores/auth-store";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { RefreshCwIcon } from "lucide-react";
import { handleError } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import NumberGroupInputMemo from "../dashboard/number-group-input";
import { useCountdown } from "@/hooks/use-countdown";
import { OTP_LENGTH, OTP_VALIDITY_SECONDS, formatCountdown } from "@/constants/otp";

export default function EnterOtpForm() {

    const navigate = useNavigate();
    const { verifyOtp, phoneNumber, sendOtp, createClinicianProfile, createPatientProfile, createAttendantProfile } = useAuthStore();

    const { role_intent, view, patient_id } = useSearch({ from: '/(auth)/enter-otp' });

    const [isLoading, setIsLoading] = useState(false);

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [isValidOtp, setIsValidOtp] = useState(false);
    const [resetOtp, setResetOtp] = useState(Math.random());

    const { remaining: validitySeconds, hasEnded: isExpired, restart: restartValidity } = useCountdown(OTP_VALIDITY_SECONDS);

    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handleOtpComplete = useCallback((isComplete: boolean) => {
        setIsValidOtp(isComplete);
        if (isComplete) {
            submitButtonRef.current?.focus();
        }
    }, [])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            // A chosen role_intent means "create this account" — which also lets an
            // existing phone add a new account type. No intent means a plain sign-in.
            if (role_intent === 'patient') {
                await createPatientProfile(phoneNumber, otp.join("").trim());
                navigate({ to: "/patient" });
            } else if (role_intent === 'attendant') {
                await createAttendantProfile(phoneNumber, otp.join("").trim());
                navigate({ to: "/attendant" });
            } else if (role_intent === 'clinician') {
                await createClinicianProfile(phoneNumber, otp.join("").trim());
                navigate({ to: "/doctor" });
            } else {
                await verifyOtp(phoneNumber, otp.join("").trim(), view, patient_id);
                toast.success("OTP verified successfully!");
                const activeView = useAuthStore.getState().activeView;
                const target = activeView === "patient" ? "/patient" : activeView === "attendant" ? "/attendant" : "/doctor";
                navigate({ to: target });
            }

        } catch (error) {
            // The backend's own message (invalid OTP, role conflict, etc.) is surfaced by
            // handleError; this fallback only covers truly unknown failures.
            handleError(error, "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function resendOtp(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        // A guard, not just UI state: one live code at a time keeps us clear of the 60s window.
        if (!isExpired) return;
        setIsLoading(true);
        try {
            await sendOtp(phoneNumber);
            restartValidity();
            setOtp(Array(OTP_LENGTH).fill(""));
            setResetOtp(Math.random());
            toast.success("New code sent.");
        } catch (error) {
            handleError(error, "Failed to resend OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <NumberGroupInputMemo
                numberInput={otp}
                setNumberInput={setOtp}
                onComplete={handleOtpComplete}
                inputLength={OTP_LENGTH}
                secondGroupStartIndex={-1}
                dynamicValuesStartIndex={0}
                groupLabel="One-time passcode"
                autoComplete="one-time-code"
                disabled={isExpired}
                key={resetOtp}
            />
            {/* Only the expired state is announced; a ticking clock would interrupt screen
                readers every second. */}
            {isExpired ? (
                <p role="status" className="text-sm text-rose-600">
                    Code expired.
                </p>
            ) : (
                <div className="space-y-0.5">
                    <p className="text-sm text-gray-600">
                        Code valid for {formatCountdown(validitySeconds)}
                    </p>
                    <p className="text-xs text-gray-500">
                        Didn't get it? Resend when the timer ends.
                    </p>
                </div>
            )}

            {isExpired ? (
                <Button
                    type="button"
                    isLoading={isLoading}
                    className="w-full"
                    onClick={resendOtp}
                >
                    <RefreshCwIcon className="mr-1.5 inline-block size-4" />
                    Resend code
                </Button>
            ) : (
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                    ref={submitButtonRef}
                    disabled={!isValidOtp}
                    onClick={onSubmit}
                >
                    Verify
                </Button>
            )}
        </form>
    )
}