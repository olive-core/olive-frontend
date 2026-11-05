import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { FREE_TRIAL_CONSULTATIONS } from "@/lib/subscription";

// States the terms plainly and leaves the decision to the doctor: no urgency, no pressure.
export default function GetStartedSection() {
    return (
        <section className="px-4 pb-14 md:py-28">
            <div className="mx-auto max-w-5xl rounded-3xl bg-brand px-5 py-10 md:px-12 md:py-20 md:text-center">
                <h2 className="font-display text-3xl text-white md:text-4xl">
                    Your first {FREE_TRIAL_CONSULTATIONS} consultations are free
                </h2>
                <p className="mt-3 max-w-lg text-lg leading-relaxed text-white/85 md:mx-auto md:mt-4">
                    Register with your phone number and use Olive in your practice. No payment details needed.
                    After {FREE_TRIAL_CONSULTATIONS} consultations, decide whether you want to continue.
                </p>
                <Button asChild size="lg" data-landing-cta className="mt-7 h-14 w-full bg-white px-8 text-base font-semibold text-brand-700 hover:bg-brand-mist md:mt-8 md:w-auto">
                    <Link to="/sign-in">Register or sign in</Link>
                </Button>
                <p className="mt-4 text-sm text-white/75">Already registered? Sign in the same way.</p>
            </div>
        </section>
    );
}
