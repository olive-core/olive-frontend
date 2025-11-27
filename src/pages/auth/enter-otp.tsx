import EnterOtpForm from "@/components/auth/enter-otp-form";

export default function EnterOtpPage() {
    return (
        <div className="flex items-center justify-center p-6 h-full border-0 lg:border rounded-xl">
            <div className="w-full max-w-lg">
                <h3 className="text-xl mb-4 font-display">Enter OTP</h3>

                <EnterOtpForm />
            </div>
        </div>
    )
}