import { CheckCircle2Icon, LockIcon, UserCheckIcon } from "lucide-react";

// Each line is a product guarantee, not a feature claim: keep it that way.
const GUARANTEES = [
    { icon: UserCheckIcon, title: "Nothing is final until you approve it", text: "Olive drafts. You decide what goes on the prescription." },
    { icon: CheckCircle2Icon, title: "Nothing reaches the patient on its own", text: "Only the prescription you save is printed or sent." },
    { icon: LockIcon, title: "Your clinical notes stay private", text: "Notes are for you and never shown to the patient." },
];

// Phones read it as a settings-style list in one card; wider screens as three columns.
export default function InControlSection() {
    return (
        <section className="py-14 md:border-y md:border-slate-200/70 md:py-24">
            <div className="container">
                <h2 className="font-display text-3xl text-brand-ink md:text-center md:text-4xl">You stay in control</h2>
                <ul className="mt-6 divide-y divide-slate-200/80 rounded-3xl bg-brand-mist md:mx-auto md:mt-14 md:grid md:max-w-5xl md:grid-cols-3 md:gap-8 md:divide-y-0 md:bg-transparent">
                    {GUARANTEES.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="flex gap-4 px-5 py-5 md:flex-col md:items-center md:p-0 md:text-center">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand md:size-auto md:bg-transparent">
                                <Icon className="size-5 md:size-7" strokeWidth={1.75} aria-hidden />
                            </span>
                            <div>
                                <h3 className="font-semibold text-brand-ink md:mt-4 md:text-lg">{title}</h3>
                                <p className="mt-1 text-slate-600 md:mt-2">{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
