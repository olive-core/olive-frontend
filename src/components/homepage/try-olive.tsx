import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function TryOliveSection() {
    return (
        <section id="try-olive" className="scroll-mt-20 px-4 pb-6 md:pb-28">
            <div className="mx-auto max-w-5xl rounded-3xl bg-brand-mist px-5 py-10 md:px-12 md:py-20 md:text-center">
                <h2 className="font-display text-3xl text-brand-ink md:text-4xl">Try it yourself</h2>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-slate-600 md:mx-auto md:mt-4">
                    Read a sample consultation aloud and watch Olive draft the prescription.
                    No account needed, and nothing is saved.
                </p>
                <Button asChild size="lg" data-landing-cta className="mt-7 h-14 w-full bg-brand px-8 text-base font-semibold text-white hover:bg-brand-700 md:mt-8 md:w-auto">
                    <Link to="/try">
                        Try Olive
                        <ArrowRightIcon className="size-5" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
