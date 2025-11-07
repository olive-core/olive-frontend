import { cn } from "@/lib/utils";
import { useState } from "react";

type FeatureType = {
    title: string;
    description: string;
    iconSrc: string;
}

const features: FeatureType[] = [
    {
        title: "Accurate Voice Transcription",
        description: "Converts medical conversations into precise, structured notes.",
        iconSrc: "/homepage/microphone"
    },
    {
        title: "AI-Assisted Prescription Drafting",
        description: "Generates smart, editable drafts based on your conversation.",
        iconSrc: "/homepage/artificial-intelligence"
    },
    {
        title: "Huge Medicine Knowledge Base",
        description: "Backed by an extensive dataset of medicines, dosages, and interactions.",
        iconSrc: "/homepage/medicine"
    },
    {
        title: "Personalized Prescription Generation",
        description: "Learns your preferences over time for faster, customized outputs.",
        iconSrc: "/homepage/personnel"
    },
    {
        title: "Smart Patient History",
        description: "Access previous consultations and prescriptions instantly.",
        iconSrc: "/homepage/medical-history"
    },
    {
        title: "Instant Prescription Sharing",
        description: "Send finalized prescriptions directly to patients or pharmacies in seconds.",
        iconSrc: "/homepage/share"
    }
];


export default function FeaturesSection() {

    const [isHovered, setIsHovered] = useState<number | null>(null);


    return (
        <section id="features" className="py-24 container">
            <h3 className="font-display text-center text-2xl">Powerful Features for Modern Healthcare</h3>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-4 p-6 border rounded-xl"
                        onMouseEnter={() => setIsHovered(index)}
                        onMouseLeave={() => setIsHovered(null)}
                    >
                        <img
                            src={feature.iconSrc + (index === isHovered ? ".gif" : ".png")}
                            alt={`${feature.title} icon`}
                            className={cn(index === isHovered ? "h-20 w-20 p-0" : "h-20 w-20 p-2.5")}
                        />
                        <h4 className="font-display text-lg text-slate-700">{feature.title}</h4>
                        <p className="text-center text-slate-600">{feature.description}</p>
                    </div>
                ))}

            </div>
        </section>
    )
}
