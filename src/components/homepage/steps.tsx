import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import PhoneFrame from "./phone-frame";

type Image = { src: string; width: number; height: number };

type Step = {
    tab: string;
    title: string;
    description: string;
    alt: string;
    desktop: Image;
    // The printed page looks the same on any screen, so it has no phone screenshot.
    phone?: Image;
};

// Screenshots are the real app screens with a fictional patient, captured by
// probe/capture-landing-shots.mjs. Retake them there when the UI changes.
const STEPS: Step[] = [
    {
        tab: "Record",
        title: "Record the consultation",
        description: "Press record and talk to your patient as you always do. Olive listens in Bangla, English, or both.",
        alt: "Olive recording a consultation, with the patient's previous visit beside it",
        desktop: { src: "/landing/record-desktop.webp", width: 2048, height: 1600 },
        phone: { src: "/landing/record-phone.webp", width: 780, height: 1688 },
    },
    {
        tab: "Review",
        title: "Review the draft",
        description: "Olive drafts the prescription and your clinical notes. Every line is yours to change before anything is saved.",
        alt: "A drafted prescription open for editing, with vitals, complaints and medicines",
        desktop: { src: "/landing/review-desktop.webp", width: 2048, height: 1600 },
        phone: { src: "/landing/review-phone.webp", width: 780, height: 1688 },
    },
    {
        tab: "Print",
        title: "Print or send",
        description: "Print on your own pad or on Olive's letterhead, and send a copy to your patient's phone by SMS.",
        alt: "The finished prescription as it prints, on a doctor's letterhead",
        desktop: { src: "/landing/print.webp", width: 1588, height: 2322 },
    },
];

function Screenshot({ image, alt, isPaper }: { image: Image; alt: string; isPaper: boolean }) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/8",
                isPaper && "mx-auto max-w-md",
            )}
        >
            <img src={image.src} width={image.width} height={image.height} alt={alt} loading="lazy" decoding="async" className="h-auto w-full" />
        </div>
    );
}

function StepNumber({ index }: { index: number }) {
    return (
        <span className="flex size-10 items-center justify-center rounded-full bg-brand/10 font-display text-lg text-brand">
            {index + 1}
        </span>
    );
}

function DesktopSteps() {
    return (
        <ol className="mt-20 hidden flex-col gap-28 md:flex">
            {STEPS.map((step, index) => (
                <li key={step.title} className="grid grid-cols-5 items-center gap-12">
                    <div className={cn("col-span-2", index % 2 === 1 && "order-last")}>
                        <StepNumber index={index} />
                        <h3 className="mt-5 font-display text-3xl text-brand-ink">{step.title}</h3>
                        <p className="mt-3 text-lg leading-relaxed text-slate-600">{step.description}</p>
                    </div>
                    <div className="col-span-3">
                        <Screenshot image={step.desktop} alt={step.alt} isPaper={!step.phone} />
                    </div>
                </li>
            ))}
        </ol>
    );
}

// Phones swipe through the steps instead of scrolling past three screens of them. The
// next slide peeks in so the swipe is discoverable; the tabs jump straight to a step.
function PhoneSteps() {
    const trackRef = useRef<HTMLOListElement>(null);
    const [active, setActive] = useState(0);

    function slideAt(index: number) {
        return trackRef.current?.children[index] as HTMLElement | undefined;
    }

    function showStep(index: number) {
        const track = trackRef.current;
        const slide = slideAt(index);
        if (!track || !slide) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function onScroll() {
        const track = trackRef.current;
        const first = slideAt(0);
        const second = slideAt(1);
        if (!track || !first || !second) return;
        setActive(Math.round(track.scrollLeft / (second.offsetLeft - first.offsetLeft)));
    }

    return (
        <div className="md:hidden">
            <nav aria-label="Steps" className="mx-4 mt-8 grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1">
                {STEPS.map((step, index) => (
                    <button
                        key={step.tab}
                        type="button"
                        aria-current={active === index ? "step" : undefined}
                        onClick={() => showStep(index)}
                        className={cn(
                            "min-h-10 rounded-full text-sm font-semibold transition-colors",
                            active === index ? "bg-white text-brand-700 shadow-sm" : "text-slate-500",
                        )}
                    >
                        {index + 1}. {step.tab}
                    </button>
                ))}
            </nav>

            <ol
                ref={trackRef}
                onScroll={onScroll}
                className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {STEPS.map((step, index) => (
                    <li
                        key={step.title}
                        aria-label={`Step ${index + 1} of ${STEPS.length}`}
                        className="flex w-[84%] shrink-0 snap-start flex-col rounded-3xl bg-brand-mist px-5 pb-6 pt-6"
                    >
                        {step.phone ? (
                            <PhoneFrame src={step.phone.src} alt={step.alt} />
                        ) : (
                            // Paper is wider than a phone screen: a page-shaped box keeps the whole width.
                            <div className="mx-auto aspect-[3/4] w-full max-w-[17rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                                <img src={step.desktop.src} alt={step.alt} width={step.desktop.width} height={step.desktop.height} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                            </div>
                        )}
                        <h3 className="mt-6 font-display text-xl text-brand-ink">{step.title}</h3>
                        <p className="mt-2 leading-relaxed text-slate-600">{step.description}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function StepsSection() {
    return (
        <section id="how-it-works" className="scroll-mt-20 py-14 md:py-28">
            <div className="container">
                <h2 className="font-display text-3xl text-brand-ink md:text-center md:text-4xl">How it works</h2>
                <DesktopSteps />
            </div>
            <PhoneSteps />
        </section>
    );
}
