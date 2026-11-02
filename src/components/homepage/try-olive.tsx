import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function TryOliveSection() {
    return (
        <section id="try-olive" className="scroll-mt-24 px-4 pb-20 sm:pb-28">
            <div className="mx-auto max-w-5xl rounded-3xl bg-brand-mist px-6 py-14 text-center sm:px-12 sm:py-20">
                <h2 className="font-display text-3xl text-brand-ink sm:text-4xl">Try it yourself</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                    Read a sample consultation aloud and watch Olive draft the prescription.
                    No account needed, and nothing is saved.
                </p>
                <Button asChild size="lg" className="mt-8 h-14 bg-brand px-8 text-base font-semibold text-white hover:bg-brand-deep">
                    <Link to="/try">
                        Try Olive
                        <ArrowRightIcon className="size-5" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
