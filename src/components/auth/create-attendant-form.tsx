import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { handleError } from "@/lib/utils";

interface CreateAttendantFormProps {
    phoneNumber: string[];
}

export default function CreateAttendantForm({ phoneNumber }: CreateAttendantFormProps) {
    const navigate = useNavigate();
    const { storePendingAttendant, sendOtp } = useAuthStore();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit() {
        if (!firstName.trim() || !lastName.trim()) return;
        setIsSubmitting(true);
        storePendingAttendant({ firstName: firstName.trim(), lastName: lastName.trim() });
        try {
            await sendOtp("+88".concat(phoneNumber.join("").trim()));
            toast.success("OTP sent successfully!");
            navigate({ to: "/enter-otp", search: { exists: 0, role_intent: "attendant" } });
        } catch (error) {
            handleError(error, "Failed to send OTP. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="max-w-xl mx-auto py-8">
            <CardHeader>
                <CardTitle className="text-center">Create Attendant Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
                <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <Button
                    className="w-full"
                    onClick={submit}
                    isLoading={isSubmitting}
                    disabled={!firstName.trim() || !lastName.trim()}
                >
                    Continue
                </Button>
            </CardContent>
        </Card>
    );
}
