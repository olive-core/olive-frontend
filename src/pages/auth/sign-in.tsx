import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center p-6 h-full border-0 lg:border rounded-xl min-w-[360px]">
            <div className="w-full max-w-sm">
                <h3 className="text-xl mb-4 font-display">Sign In</h3>
                <SignInForm />
            </div>
        </div>
    )
}