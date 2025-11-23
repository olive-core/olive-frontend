import { BotIcon, FileIcon, FolderClockIcon, MicIcon, PillIcon, SendIcon } from "lucide-react";

type FeatureType = {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const features: FeatureType[] = [
    {
        title: "Accurate Voice Transcription",
        description: "Converts medical conversations into precise, structured notes.",
        icon: <MicIcon />,
    },
    {
        title: "AI-Assisted Prescription Drafting",
        description: "Generates smart, editable drafts based on your conversation.",
        icon: <BotIcon />,
    },
    {
        title: "Huge Medicine Knowledge Base",
        description: "Backed by an extensive dataset of medicines, dosages, and interactions.",
        icon: <PillIcon />,
    },
    {
        title: "Personalized Prescription Generation",
        description: "Learns your preferences over time for faster, customized outputs.",
        icon: <FileIcon />
    },
    {
        title: "Smart Patient History",
        description: "Access previous consultations and prescriptions instantly.",
        icon: <FolderClockIcon />,
    },
    {
        title: "Instant Prescription Sharing",
        description: "Send finalized prescriptions directly to patients or pharmacies in seconds.",
        icon: <SendIcon />,
    }
];


export default function FeaturesSection() {


    return (
        <section id="features" className="py-24 container">
            <h3 className="font-display text-center text-2xl">Powerful Features for Modern Healthcare</h3>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-x-20 gap-y-12 mb-24">
                {features.map((feature, index) => (
                    <div key={index}>
                        <div className="p-4 rounded-full bg-primary/10 inline-block text-emerald-950">
                            {feature.icon}
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900">{feature.title}</h4>
                        <p className="text-slate-600 mt-2">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
