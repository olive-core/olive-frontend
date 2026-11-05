import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "../ui/button";

// Doctors here switch languages mid-sentence; saying so up front is the point.
const LANGUAGES = ["বাংলা", "English", "Both, mixed"];

// One sentence, one line of support, one button. Most visitors are new — signed-in doctors
// never see this page — so the hero offers the zero-commitment step: trying Olive.
// On a phone it fills the screen like an app's first screen, button in thumb reach.
export default function HeroSection() {
    return (
        <section className="bg-radial-[at_50%_35%] from-brand/12 via-brand-mist/60 to-white pb-6 pt-24 md:pb-16 md:pt-36">
            {/* Vertical padding sits on the section: the global .container rule resets padding. */}
            <div className="container flex min-h-[calc(100svh-7.5rem)] flex-col md:min-h-[calc(88svh-13rem)]">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <img src="/logo/olive-app-icon.svg" alt="" width={64} height={64} className="mb-7 size-14 rounded-2xl shadow-lg shadow-brand/25 md:size-16" />

                    <h1 className="max-w-5xl font-display text-[2.2rem] leading-[1.08] min-[380px]:text-[2.6rem] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
                        Talk to your patient.<br />
                        <span className="text-brand">Olive drafts the prescription.</span>
                    </h1>

                    <p className="mt-5 max-w-xl text-lg text-slate-600 sm:text-xl md:mt-6">
                        <span className="font-semibold text-brand-ink">No manual writing.</span> You review, edit and print.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                        <span className="text-slate-500">Understands</span>
                        {LANGUAGES.map((language) => (
                            <span key={language} className="rounded-full border border-brand-200 bg-white/80 px-3 py-1 font-medium text-brand-700">
                                {language}
                            </span>
                        ))}
                    </div>

                    <Button asChild size="lg" data-landing-cta className="mt-10 h-14 w-full max-w-sm bg-brand px-8 text-base font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-700 md:w-auto">
                        <Link to="/try">
                            Try Olive, no account needed
                            <ArrowRightIcon className="size-5" />
                        </Link>
                    </Button>
                </div>

                <a href="#how-it-works" className="mx-auto mt-8 flex min-h-11 flex-col items-center text-sm font-medium text-slate-500 md:hidden">
                    How it works
                    <ChevronDownIcon className="size-5 animate-bounce motion-reduce:animate-none" aria-hidden />
                </a>
            </div>
        </section>
    );
}
