type StepType = {
    title: string;
    description: string;
    iconSrc: string;
}

const steps: StepType[] = [
    {
        title: "Record the Consultation",
        description: "Leverage ambient speech technology to capture the entire conversation and transcribe instantly.",
        iconSrc: "/homepage/voice-message.png"
    },
    {
        title: "AI Drafts the Prescription",
        description: "Olive’s AI analyzes the dialogue, extracts key clinical details, and generates a structured prescription draft in seconds.",
        iconSrc: "/homepage/robot.png"
    },
    {
        title: "Review and Finalize",
        description: "Skip manual typing; simply review, edit if needed, and share the finalized prescription instantly.",
        iconSrc: "/homepage/review.png"
    }
];


export default function StepsSection() {

    function renderFeatureCard({
        title,
        description,
        iconSrc
    }: {
        title: string;
        description: string;
        iconSrc: string;
    }) {
        return (
            <div className="flex flex-col items-center gap-2 md:gap-4 p-4 md:p-6">
                <img src={iconSrc} alt={`${title} icon`} className="h-20 w-20" />
                <h4 className="font-display text-lg text-emerald-950/90">{title}</h4>
                <p className="text-center text-emerald-950/60">{description}</p>
            </div>
        )
    }

    return (
        <section id="how-it-works" className="container">
            <div className="w-full px-6 md:px-12 py-12 md:py-16 rounded-2xl bg-primary/15 mb-24">
                <h3 className="font-display text-center text-2xl font-medium text-emerald-950">
                    3 Steps to Effortless Prescriptions
                </h3>

                <div className="mt-6 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-x-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex justify-center">
                            {renderFeatureCard(step)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}