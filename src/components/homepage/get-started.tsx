import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";

export default function GetStartedSection() {
    return (
        <section className="px-4 pb-14 md:py-28">
            <div className="mx-auto max-w-5xl rounded-3xl bg-brand px-5 py-10 md:px-12 md:py-20 md:text-center">
                <h2 className="font-display text-3xl text-white md:text-4xl">Start using Olive</h2>
                <p className="mt-3 max-w-md text-lg leading-relaxed text-white/85 md:mx-auto md:mt-4">
                    Register with your phone number. Already registered? Sign in the same way.
                </p>
                <Button asChild size="lg" data-landing-cta className="mt-7 h-14 w-full bg-white px-8 text-base font-semibold text-brand-700 hover:bg-brand-mist md:mt-8 md:w-auto">
                    <Link to="/sign-in">Register or sign in</Link>
                </Button>
            </div>
        </section>
    );
}
