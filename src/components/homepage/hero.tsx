import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";

// One sentence, one line of support, one button. Most visitors are new — signed-in doctors
// never see this page — so the hero offers the zero-commitment step: trying Olive.
export default function HeroSection() {
    return (
        <section className="bg-radial-[at_50%_35%] from-brand/12 via-brand-mist/60 to-white pb-16 pt-32 sm:pt-36">
            {/* Vertical padding sits on the section: the global .container rule resets padding. */}
            <div className="container flex min-h-[calc(88svh-13rem)] flex-col items-center justify-center text-center">
                <h1 className="max-w-5xl font-display text-[2.5rem] leading-[1.1] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
                    Talk to your patient.<br />
                    <span className="text-brand">Olive drafts the prescription.</span>
                </h1>

                <p className="mt-6 max-w-xl text-lg text-slate-600 sm:text-xl">
                    You review, edit and print. In Bangla, English, or both.
                </p>

                <Button asChild size="lg" className="mt-10 h-14 bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-700">
                    <Link to="/try">
                        Try Olive, no account needed
                        <ArrowRightIcon className="size-5" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
