type StepType = {
    title: string;
    description: string;
    iconSrc: string;
}

const steps: StepType[] = [
    {
        title: "Record the Consultation",
        description: "Record your session — everything is transcribed instantly and securely.",
        iconSrc: "/homepage/voice-message.png"
    },
    {
        title: "AI Drafts the Prescription",
        description: "AI analyzes the dialogue and prepares a structured draft.",
        iconSrc: "/homepage/robot.png"
    },
    {
        title: "Review and Finalize",
        description: "Edit, approve, and share the final prescription effortlessly.",
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
            <div className="flex flex-col items-center gap-4 p-6">
                <img src={iconSrc} alt={`${title} icon`} className="h-20 w-20" />
                <h4 className="font-display text-lg text-sky-950/90">{title}</h4>
                <p className="text-center text-sky-950/50">{description}</p>
            </div>
        )
    }

    return (
        <section id="how-it-works" className="container">
            <div className="w-full px-12 py-16 rounded-2xl bg-sky-200/40">
                <h3 className="font-display text-center text-2xl font-medium text-sky-950">
                    3 Steps to Effortless Prescriptions
                </h3>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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