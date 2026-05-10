import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface SummaryBlockProps {
    summary?: string | null;
}

export default function SummaryBlock({ summary }: SummaryBlockProps) {
    if (!summary || !summary.trim()) return null;

    return (
        <div className="px-4 print:hidden">
            <Accordion type="single" collapsible>
                <AccordionItem value="summary">
                    <AccordionTrigger>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">
                            Summary
                        </h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        {summary}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
