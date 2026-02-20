import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { handleError } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import NumberGroupInputMemo from "../dashboard/number-group-input";
import PatientSkeleton from "../dashboard/patient/skeleton";
import CreateDoctorForm from "./create-doctor-form";

export default function SignInForm() {

    const navigate = useNavigate();
    const { sendOtp, doesUserExist } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [doesExist, setDoesExist] = useState<0 | 1>(1);

    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill(" ")));
    // const [isValidPhone, setIsValidPhone] = useState(false);

    const [showPanel, setShowPanel] = useState<null | "create" | "otp" | "error">(null);

    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handlePhoneComplete = useCallback(async (isComplete: boolean) => {
        // setIsValidPhone(isComplete);
        if (isComplete) {
            try {
                setIsChecking(true);
                setShowPanel(null);
                const doesExistClinician = await doesUserExist("+88".concat(phoneNumber.join("").trim()));

                setDoesExist(doesExistClinician ? 1 : 0);

                if (doesExistClinician) {
                    setShowPanel("otp");
                    submitButtonRef.current?.focus();
                } else {
                    setShowPanel("create");
                }
            } catch (error) {
                console.error(error)
                setShowPanel("error");
            } finally {
                setIsChecking(false);
            }
        }
    }, [doesUserExist, phoneNumber])

    async function handleSubmit() {
        setIsLoading(true);
        try {
            await sendOtp("+88".concat(phoneNumber.join("").trim()));
            toast.success("OTP sent successfully!");
            navigate({ to: "/enter-otp", search: { exists: doesExist } });
        } catch (error) {
            handleError(error, "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="space-y-4">
            <NumberGroupInputMemo
                numberInput={phoneNumber}
                setNumberInput={setPhoneNumber}
                onComplete={handlePhoneComplete}
            />

            {/* skeleton */}
            {isChecking && (
                <PatientSkeleton />
            )}

            {/* create doctor */}
            {showPanel === "create" && (
                <div className="">
                    <CreateDoctorForm phoneNumber={phoneNumber} doesExist={doesExist} />
                </div>
            )}

            {/* send otp */}
            {showPanel === "otp" && (
                <Button ref={submitButtonRef} onClick={handleSubmit} isLoading={isLoading}>
                    Send OTP
                </Button>
            )}

            {/* error */}
            {showPanel === "error" && (
                <div className="border-rose-300 rounded-md px-6 py-4 text-rose-600 bg-rose-100 mt-4">Something went wrong!</div>
            )}
        </div>
    )
}