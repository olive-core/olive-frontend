import { MailIcon } from "lucide-react";

export default function AboutContact() {
    return (
        <section className="pt-12 pb-8 container">
            <div className="max-w-xl mx-auto text-center px-6 py-8 rounded-2xl bg-emerald-100/70">
                <MailIcon className="mx-auto size-6 text-emerald-700" />
                <h3 className="font-display text-xl mt-3">Get in touch</h3>
                <a
                    href="mailto:asifazad@oliveai.life"
                    className="inline-block mt-1 text-emerald-700 font-medium hover:text-emerald-900 transition-colors"
                >
                    asifazad@oliveai.life
                </a>
                <p className="text-slate-600 mt-1 text-sm">
                    Questions, partnerships, or just a hello — we'd love to hear from you.
                </p>

            </div>
        </section>
    );
}
