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
            <div className="flex flex-col items-center gap-2 md:gap-4 p-4 md:p-6">
                <img src={iconSrc} alt={`${title} icon`} className="h-20 w-20" />
                <h4 className="font-display text-lg text-emerald-950/90">{title}</h4>
                <p className="text-center text-emerald-950/60">{description}</p>
            </div>
        )
    }

    return (
        <section id="how-it-works" className="container">
            <div className="w-full px-6 md:px-12 py-12 md:py-16 rounded-2xl bg-emerald-100/70 mb-24 relative overflow-hidden">

                <div className="absolute rounded-full bg-emerald-200/70 -top-24 -left-24 w-64 h-64"></div>
                <div className="absolute rounded-full bg-emerald-200/50 -top-32 -left-32 w-80 h-80"></div>
                <div className="absolute rounded-full bg-emerald-200/20 -top-40 -left-40 w-96 h-96"></div>

                <div className="absolute rounded-full bg-emerald-200/70 -bottom-32 -right-32 w-64 h-64"></div>
                <div className="absolute rounded-full bg-emerald-200/50 -bottom-40 -right-40 w-80 h-80"></div>
                <div className="absolute rounded-full bg-emerald-200/20 -bottom-48 -right-48 w-96 h-96" />

                <h3 className="font-display text-center text-2xl font-medium text-emerald-950">
                    3 Steps to Effortless Prescriptions
                </h3>

                <div className="mt-6 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-x-8 z-10 relative">
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