import { createFileRoute } from '@tanstack/react-router'
import EnterOtpForm from "@/components/auth/enter-otp-form";

type EnterOtpSearch = {
    exists: 1 | 0;
    role_intent?: 'patient' | 'clinician';
}

export const Route = createFileRoute('/(auth)/enter-otp')({
    validateSearch: (search: Record<string, unknown>): EnterOtpSearch => {
        return {
            exists: search.exists === 1 ? 1 : 0,
            role_intent: (search.role_intent === 'patient' || search.role_intent === 'clinician')
                ? search.role_intent
                : undefined,
        }
    },
    component: EnterOtpPage,
})


function EnterOtpPage() {
    return (
        <div className="flex items-center justify-center p-6 h-full border-0 lg:border rounded-xl">
            <div className="w-full max-w-lg">
                <h3 className="text-xl mb-4 font-display">Enter OTP</h3>

                <EnterOtpForm />
            </div>
        </div>
    )
}