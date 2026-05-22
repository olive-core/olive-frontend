import { TextAnimate } from "../ui/text-animate";

export default function AboutHero() {
    return (
        <section className="bg-radial from-primary/13 to-transparent">
            <div className="flex items-center justify-center container mx-auto">
                <div className="flex flex-col items-center max-w-3xl text-center pt-24 pb-8 sm:pt-28 sm:pb-10">

                    <TextAnimate
                        animation="blurInUp"
                        by="line"
                        once
                        className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight font-light"
                        as="h2"
                    >
                        Inventing Tomorrow
                    </TextAnimate>

                    <p className="text-base sm:text-lg mt-5 opacity-80">
                        Olive AI is reimagining healthcare through artificial intelligence starting from Dhaka, built for the world.
                    </p>
                </div>
            </div>
        </section>
    );
}
