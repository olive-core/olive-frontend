import { ActivityIcon, BrainCircuitIcon, ClockCheckIcon, PenOffIcon } from "lucide-react";

type ValueType = {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const values: ValueType[] = [
    {
        title: "No More Handwritten Prescriptions",
        description: "Generate clean, digital prescriptions that patients can easily read and share.",
        icon: <PenOffIcon />
    },
    {
        title: "Time-Saving Smart Automation",
        description: "Cut down documentation time and focus more on patient interaction.",
        icon: <ClockCheckIcon />
    },
    {
        title: "AI-Powered Clinical Decision Support (CDS)",
        description: "Get smart suggestions for diagnoses, medicines, and dosages.",
        icon: <BrainCircuitIcon />
    },
    {
        title: "Comprehensive Digital Health Records",
        description: "Build a structured patient record with every consultation — no files lost or misplaced.",
        icon: <ActivityIcon />
    },
];


export default function ValuesSection() {


    return (
        <section id="values" className="py-24 container">
            <h3 className="font-display text-center text-2xl">Why Olive AI Matters</h3>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16 mb-24">
                {values.map((value, index) => (
                    <div key={index} className="flex gap-12 items-end group">
                        <div className="relative bg-emerald-200/50 rounded-tl-lg rounded-br-4xl outline-2 outline-offset-4 outline-dashed outline-emerald-200 p-8 flex items-center justify-center">
                            {value.icon}
                        </div>
                        <div className="">
                            <h4 className="font-semibold text-lg text-slate-700 pb-2">{value.title}</h4>
                            <div className="w-12 h-1 bg-primary opacity-40 transition-opacity duration-300"></div>
                            <p className="text-slate-600 mt-2">{value.description}</p>
                        </div>
                    </div>
                ))}

            </div>
        </section>
    )
}
