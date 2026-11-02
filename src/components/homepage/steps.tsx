import { cn } from "@/lib/utils";

type Screenshot = {
    alt: string;
    desktop: { src: string; width: number; height: number };
    // The printed page looks the same on any screen, so it has no phone version.
    phone?: { src: string; width: number; height: number };
};

type Step = {
    title: string;
    description: string;
    screenshot: Screenshot;
};

// Screenshots are the real app screens with a fictional patient, captured by
// probe/capture-landing-shots.mjs. Retake them there when the UI changes.
const STEPS: Step[] = [
    {
        title: "Record the consultation",
        description: "Press record and talk to your patient as you always do. Olive listens in Bangla, English, or both.",
        screenshot: {
            alt: "Olive recording a consultation, with the patient's previous visit beside it",
            desktop: { src: "/landing/record-desktop.webp", width: 1920, height: 1200 },
            phone: { src: "/landing/record-phone.webp", width: 780, height: 1688 },
        },
    },
    {
        title: "Review the draft",
        description: "Olive drafts the prescription and your clinical notes. Every line is yours to change before anything is saved.",
        screenshot: {
            alt: "A drafted prescription open for editing, with complaints, history and medicines",
            desktop: { src: "/landing/review-desktop.webp", width: 1920, height: 1200 },
            phone: { src: "/landing/review-phone.webp", width: 780, height: 1688 },
        },
    },
    {
        title: "Print or send",
        description: "Print on your own pad or on Olive's letterhead, and send a copy to your patient's phone by SMS.",
        screenshot: {
            alt: "The finished prescription as it prints, on a doctor's letterhead",
            desktop: { src: "/landing/print.webp", width: 1588, height: 2322 },
        },
    },
];

function StepScreenshot({ screenshot }: { screenshot: Screenshot }) {
    const { desktop, phone, alt } = screenshot;
    const isPaper = !phone;

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/8",
                isPaper ? "mx-auto max-w-sm lg:max-w-md" : "mx-auto max-w-xs md:max-w-none",
            )}
        >
            <picture>
                {phone && <source media="(min-width: 768px)" srcSet={desktop.src} width={desktop.width} height={desktop.height} />}
                <img
                    src={phone?.src ?? desktop.src}
                    width={phone?.width ?? desktop.width}
                    height={phone?.height ?? desktop.height}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                />
            </picture>
        </div>
    );
}

export default function StepsSection() {
    return (
        <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
            <div className="container">
                <h2 className="text-center font-display text-3xl text-brand-ink sm:text-4xl">How it works</h2>

                <ol className="mt-14 flex flex-col gap-20 sm:mt-20 lg:gap-28">
                    {STEPS.map((step, index) => (
                        <li key={step.title} className="grid items-center gap-8 md:grid-cols-5 md:gap-12">
                            <div className={cn("md:col-span-2", index % 2 === 1 && "md:order-last")}>
                                <span className="flex size-10 items-center justify-center rounded-full bg-brand/10 font-display text-lg text-brand">
                                    {index + 1}
                                </span>
                                <h3 className="mt-5 font-display text-2xl text-brand-ink sm:text-3xl">{step.title}</h3>
                                <p className="mt-3 text-lg leading-relaxed text-slate-600">{step.description}</p>
                            </div>
                            <div className="md:col-span-3">
                                <StepScreenshot screenshot={step.screenshot} />
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
