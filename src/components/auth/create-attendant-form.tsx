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

    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isSubmitting) submit();
    }

    async function submit() {
        if (!name.trim()) return;
        setIsSubmitting(true);
        storePendingAttendant({ name: name.trim() });
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
                <form onSubmit={onSubmit} className="space-y-3">
                    <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isSubmitting}
                        disabled={!name.trim()}
                    >
                        Continue
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
