import { useState, type ReactNode } from "react";
import { BookOpenIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sampleScript, SAMPLE_HIGHLIGHTS, type SampleHighlight } from "./sample-content";

const HIGHLIGHT_STYLES: Record<SampleHighlight, { label: string; color: string }> = {
    medicine: { label: "Medicine", color: "bg-emerald-100 text-emerald-950" },
    instruction: { label: "Dose & instructions", color: "bg-amber-100 text-amber-950" },
    investigation: { label: "Investigation", color: "bg-sky-100 text-sky-950" },
    clinical: { label: "Symptoms, history & advice", color: "bg-violet-100 text-violet-950" },
};

export function HighlightedLine({ text, language }: { text: string; language: "en" | "bn" }) {
    const phrases = SAMPLE_HIGHLIGHTS[language];
    const parts = [];
    let offset = 0;
    while (offset < text.length) {
        const match = phrases.map(([phrase, kind]) => ({ phrase, kind, index: text.indexOf(phrase, offset) }))
            .filter(item => item.index !== -1).sort((a, b) => a.index - b.index || b.phrase.length - a.phrase.length)[0];
        if (!match) { parts.push(text.slice(offset)); break; }
        if (match.index > offset) parts.push(text.slice(offset, match.index));
        const style = HIGHLIGHT_STYLES[match.kind];
        parts.push(<mark key={match.index} data-highlight={match.kind} title={style.label} className={`rounded px-0.5 font-medium ${style.color}`}>{match.phrase}</mark>);
        offset = match.index + match.phrase.length;
    }
    return <>{parts}</>;
}

export default function SampleConversation({ review = false, recorderControls }: { review?: boolean; recorderControls?: ReactNode }) {
    const [phoneOpen, setPhoneOpen] = useState(false);
    const [language, setLanguage] = useState<"en" | "bn">("bn");
    const content = <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{review ? "Compare with Arise’s draft" : "Optional sample conversation"}</p>
                <div className="flex gap-1"><Button variant={language === "bn" ? "default" : "outline"} size="sm" className="min-h-11 px-3" onClick={() => setLanguage("bn")}>বাংলা</Button><Button variant={language === "en" ? "default" : "outline"} size="sm" className="min-h-11 px-3" onClick={() => setLanguage("en")}>English</Button></div>
            </div>
            <p className="mb-2 text-xs text-slate-600">{review ? "If you read this sample, compare the highlighted details with your prescription and notes." : "Have your own fictional case? Try it with someone. No case in mind? Use this sample—read both roles alone, or take a role each."}</p>
            <div className="flex flex-wrap gap-1.5" aria-label="Highlight key">{Object.entries(HIGHLIGHT_STYLES).map(([kind, style]) => <span key={kind} className={`rounded px-2 py-0.5 text-[11px] ${style.color}`}>{style.label}</span>)}</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-emerald-500" tabIndex={0} role="region" aria-label="Sample conversation text" lang={language}>
            <div className="space-y-4">{sampleScript(language).map(([speaker, line], index) => <div key={index} className={index % 2 ? "border-l-2 border-slate-200 pl-3" : "border-l-2 border-emerald-300 pl-3"}>
                <p className="text-xs font-semibold text-emerald-700">{speaker}</p><p className="mt-1 text-sm leading-relaxed text-slate-700"><HighlightedLine text={line} language={language} /></p>
            </div>)}</div>
            <p className="mt-4 text-xs text-slate-500">Fictional practice script · About 3 minutes. Medicine details are provided for trying Olive.</p>
        </div>
    </div>;
    if (review) return <details className="group mx-auto my-4 w-full max-w-4xl overflow-hidden rounded-xl border border-emerald-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <BookOpenIcon className="size-5 shrink-0 text-emerald-700" />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-emerald-900">View sample conversation · Highlighted details</p><p className="mt-1 text-xs text-slate-600">Open to compare medicines, instructions, tests and clinical details with Arise’s output.</p></div>
            <ChevronDownIcon className="size-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="h-[28rem] border-t">{content}</div>
    </details>;
    return <>
        <section className="hidden min-h-0 min-w-0 overflow-hidden rounded-2xl border border-emerald-200 bg-white md:col-start-2 md:row-span-2 md:row-start-1 md:block" aria-label="Optional sample conversation">{content}</section>
        <Button variant="outline" className="h-auto min-h-14 w-full justify-start gap-3 whitespace-normal border-emerald-200 bg-emerald-50 p-3 text-left md:hidden" onClick={() => setPhoneOpen(true)}>
            <BookOpenIcon className="size-5 shrink-0 text-emerald-700" />
            <span><span className="block font-semibold">Need a case? Open the sample</span><span className="block text-xs font-normal text-slate-600">Highlighted script · Read along & record</span></span>
        </Button>
        <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
            <DialogContent className="[&_[data-slot=dialog-close]]:size-11 [&_[data-slot=dialog-close]]:top-0 [&_[data-slot=dialog-close]]:right-0 [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center flex h-[calc(100dvh-1rem)] max-h-[52rem] w-[calc(100%-1rem)] max-w-xl flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12 text-left">
                    <DialogTitle className="text-base">Read along &amp; record</DialogTitle>
                    <DialogDescription className="sr-only">Optional fictional sample. The conversation scrolls while recording controls stay at the bottom.</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 flex-1">{content}</div>
                {recorderControls && <div className="shrink-0 border-t bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{recorderControls}</div>}
            </DialogContent>
        </Dialog>
    </>;
}
