import { TERMS_SECTIONS, TERMS_SUBTITLE, TERMS_TITLE } from "@/lib/terms";

export default function TermsAndConditions() {
    return (
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
            <div className="border-b px-4 py-2.5">
                <h3 className="text-sm font-semibold leading-tight">{TERMS_TITLE}</h3>
                <p className="text-xs text-muted-foreground">{TERMS_SUBTITLE}</p>
            </div>

            <div className="h-[260px] sm:h-[300px] overflow-y-auto px-4 py-3 space-y-4">
                {TERMS_SECTIONS.map((section) => (
                    <section key={section.heading} className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-foreground">{section.heading}</h4>
                        {section.clauses.map((clause, index) => (
                            <p key={index} className="text-xs leading-relaxed text-muted-foreground">
                                {clause}
                            </p>
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );
}
