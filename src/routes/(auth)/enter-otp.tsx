import { createFileRoute } from '@tanstack/react-router'
import EnterOtpForm from "@/components/auth/enter-otp-form";

type existsQueryParam = {
    exists: 1 | 0;
}

export const Route = createFileRoute('/(auth)/enter-otp')({
    validateSearch: (search: Record<string, unknown>): existsQueryParam => {
        return {
            exists: search.exists === 1 ? 1 : 0,
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