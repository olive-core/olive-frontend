import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { TextAnimate } from "../ui/text-animate";

export default function HeroSection() {

    return (
        <section className="bg-radial from-primary/13 to-transparent">
            <div className="flex items-center justify-center container mx-auto">
                <div className="flex flex-col items-center max-w-4xl text-center py-24 sm:py-32 lg:py-48">

                    <TextAnimate animation="blurInUp" by="line" once className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight md:leading-16 font-light" as="h2">
                        {"Turn Every Consultation Into a \n\n Ready-to-Edit Prescription"}
                    </TextAnimate>

                    <p className="text-xl mt-8 mb-12 opacity-80">Record patient visits, let AI draft the prescription, and finalize it in minutes.</p>

                    <div className="grid w-full max-w-xl gap-4 px-4 sm:grid-cols-2 sm:gap-5">
                        <div>
                            <Button className="h-12 w-full text-base font-semibold shadow-sm" size="lg" asChild>
                                <Link to="/sign-in">Register or sign in</Link>
                            </Button>
                            <p className="mt-2 text-sm text-slate-600">Use your account to save consultations.</p>
                        </div>
                        <div>
                            <Button variant="outline" className="h-12 w-full border-emerald-600 bg-white text-base font-semibold text-emerald-800 hover:bg-emerald-50" size="lg" asChild>
                                <Link to="/try">Try without an account</Link>
                            </Button>
                            <p className="mt-2 text-sm text-slate-600">Explore a fictional practice consultation.</p>
                        </div>
                    </div>
                </div>
            </div>


        </section>
    )
}
