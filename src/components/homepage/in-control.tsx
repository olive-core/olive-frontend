import { CheckCircle2Icon, LockIcon, UserCheckIcon } from "lucide-react";

// Each line is a product guarantee, not a feature claim: keep it that way.
const GUARANTEES = [
    { icon: UserCheckIcon, title: "Nothing is final until you approve it", text: "Olive drafts. You decide what goes on the prescription." },
    { icon: CheckCircle2Icon, title: "Nothing reaches the patient on its own", text: "Only the prescription you save is printed or sent." },
    { icon: LockIcon, title: "Your clinical notes stay private", text: "Notes are for you and never shown to the patient." },
];

export default function InControlSection() {
    return (
        <section className="border-y border-slate-200/70 py-20 sm:py-24">
            <div className="container">
                <h2 className="text-center font-display text-3xl text-brand-ink sm:text-4xl">You stay in control</h2>
                <ul className="mx-auto mt-12 grid max-w-5xl gap-10 sm:mt-14 md:grid-cols-3 md:gap-8">
                    {GUARANTEES.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="text-center">
                            <Icon className="mx-auto size-7 text-brand" strokeWidth={1.75} aria-hidden />
                            <h3 className="mt-4 text-lg font-semibold text-brand-ink">{title}</h3>
                            <p className="mt-2 text-slate-600">{text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
