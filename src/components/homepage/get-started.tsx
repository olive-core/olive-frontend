import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";

export default function GetStartedSection() {
    return (
        <section className="px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl rounded-3xl bg-brand px-6 py-14 text-center sm:px-12 sm:py-20">
                <h2 className="font-display text-3xl text-white sm:text-4xl">Start using Olive</h2>
                <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-white/85">
                    Register with your phone number. Already registered? Sign in the same way.
                </p>
                <Button asChild size="lg" className="mt-8 h-14 bg-white px-8 text-base font-semibold text-brand-700 hover:bg-brand-mist">
                    <Link to="/sign-in">Register or sign in</Link>
                </Button>
            </div>
        </section>
    );
}
