import { cn } from "@/lib/utils";

type ValueType = {
    title: string;
    description: string;
    iconSrc: string;
}

const values: ValueType[] = [
    {
        title: "No Handwriting, No Typing",
        description: "Forget manual prescriptions. Olive listens, understands, and auto-generates clean, editable drafts ready for your review.",
        iconSrc: "/homepage/prescription.png"
    },
    {
        title: "Reclaim Your Time",
        description: "Skip repetitive documentation and prescription writing. Focus on patient care while Olive handles the rest.",
        iconSrc: "/homepage/on-time.png"
    },
    {
        title: "AI-Powered Clinical Decision Support (CDS)",
        description: "Get smart suggestions for diagnoses, medicines, and dosages.",
        iconSrc: "/homepage/network.png"
    },
    {
        title: "Serve More Patients",
        description: "By automating paperwork and recordkeeping, Olive lets you serve more patients in less time without burnout.",
        iconSrc: "/homepage/patient.png"
    },
];



export default function ValuesSection() {


    return (
        <section id="values" className="py-24 container">
            <h3 className="font-display text-center text-2xl">Why Olive AI Matters</h3>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                {values.map((value, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-4 p-6 rounded-xl bg-linear-to-br from-primary/20 via-primary/15 to-accent/12 transition duration-300 text-center"
                    >
                        <img
                            src={value.iconSrc}
                            alt={`${value.title} icon`}
                            className={cn("h-20 w-20 p-2.5")}
                        />
                        <h4 className="font-display text-lg text-slate-700">{value.title}</h4>
                        <p className="text-center text-slate-600">{value.description}</p>
                    </div>
                ))}

            </div>
        </section>
    )
}
