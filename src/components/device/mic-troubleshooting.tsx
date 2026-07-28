import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

// The list is deliberately framed as common cases, not a diagnosis: a mic can fail for
// reasons no checklist covers, and claiming otherwise sends a doctor looking in the
// wrong place. Ordered by how often each one turns out to be the cause.
const COMMON_CAUSES: { title: string; detail: string }[] = [
    {
        title:  "The mute key on your keyboard",
        detail: "Many laptops have a mic mute key in the function row — look for a microphone icon with a line through it. A small light on the key often means muted.",
    },
    {
        title:  "The wrong input is selected",
        detail: "If a headset or external mic is plugged in, your computer may still be listening through a different one. Check the input device in your system sound settings.",
    },
    {
        title:  "Input volume turned down",
        detail: "In your system sound settings, the input level for the selected microphone may be at or near zero.",
    },
    {
        title:  "Another app is holding the mic",
        detail: "Video call apps can keep the microphone reserved even in the background. Close them and run the test again.",
    },
    {
        title:  "The browser is blocking access",
        detail: "Check the microphone permission for this site in your browser's address bar or site settings.",
    },
    {
        title:  "Headset hardware",
        detail: "Wired headsets often have an inline mute switch. Wireless ones may be connected but out of battery.",
    },
];

// Collapsed by default: the test is the page's job, and an open checklist reads as the
// primary content when it is only a fallback.
export default function MicTroubleshooting() {
    return (
        <Card className="w-full">
            <CardContent>
                <Accordion type="single" collapsible>
                    <AccordionItem value="troubleshooting" className="border-none">
                        <AccordionTrigger className="py-0 text-sm font-semibold text-slate-900 hover:no-underline">
                            If Olive cannot hear you
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-0">
                            <p className="mb-4 text-xs text-slate-700">
                                These are the causes we see most often. They are not the only possible ones — if
                                none of these help, contact us and we will look at it with you.
                            </p>
                            <ol className="flex list-decimal flex-col gap-3 pl-5">
                                {COMMON_CAUSES.map((cause) => (
                                    <li key={cause.title} className="text-sm">
                                        <p className="font-semibold text-slate-900">{cause.title}</p>
                                        <p className="text-slate-700">{cause.detail}</p>
                                    </li>
                                ))}
                            </ol>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
