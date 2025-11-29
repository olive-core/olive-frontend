import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { TextAnimate } from "../ui/text-animate";

export default function HeroSection() {

    return (
        <section className="bg-radial from-primary/13 to-transparent">
            <div className="flex items-center justify-center container mx-auto">
                <div className="flex flex-col items-center max-w-4xl text-center py-32 lg:py-48">

                    <TextAnimate animation="blurInUp" by="line" once className="font-display text-4xl md:text-5xl leading-16 font-light" as="h2">
                        {"Turn Every Consultation Into a \n\n Ready-to-Edit Prescription"}
                    </TextAnimate>

                    <p className="text-xl mt-8 mb-12 opacity-80">Record patient visits, let AI draft the prescription, and finalize it in minutes.</p>

                    <Button className="w-48 text-lg py-6 capitalize" size="lg" asChild>
                        <Link to="/sign-in">
                            Get Started
                        </Link>
                    </Button>
                </div>
            </div>


        </section>
    )
}