import { Link } from "react-router";
import { Button } from "../ui/button";

export default function HeroSection() {

    return (
        <section className="bg-radial from-primary/20 to-transparent">

            <div className="flex items-center justify-center container mx-auto">
                <div className="flex flex-col items-center max-w-4xl text-center py-32 lg:py-48">
                    <h2 className="font-display text-5xl tracking-wide leading-16 font-light">
                        Turn Every Consultation Into a Ready-to-Edit Prescription
                    </h2>

                    <p className="text-xl mt-8 mb-12">Record patient visits, let AI draft the prescription, and finalize it in minutes.</p>

                    <Button className="w-48 text-lg py-6 capitalize" size="lg" asChild>
                        <Link to="/sign-up">
                            Get Started
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}