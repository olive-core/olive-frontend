import { AudioLines, Search, X } from "lucide-react";
import { Button } from "../ui/button";

interface UnresolvedMedicineCardProps {
    heardAs: string;
    onResolve: () => void;
    onDismiss: () => void;
}

// A medicine that was heard during the consultation but could not be matched to the
// database. It is never part of the prescription — the doctor either adds the real
// medicine from here or dismisses it. Styled distinctly (amber, dashed) so it never
// reads as a confirmed Rx line; the action rail mirrors the medicine view card.
export default function UnresolvedMedicineCard({ heardAs, onResolve, onDismiss }: UnresolvedMedicineCardProps) {
    return (
        <div className="group flex flex-col gap-1 sm:flex-row sm:items-stretch sm:gap-1.5">
            <div className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4 sm:flex-1 sm:p-5">
                <div className="flex gap-3">
                    <AudioLines className="size-5 shrink-0 text-amber-500 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-sm text-slate-700">
                            I heard something like <span className="font-semibold text-slate-900">“{heardAs}”</span>, but couldn’t quite catch it.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onResolve}
                            className="mt-3 flex h-11 items-center gap-2 cursor-pointer border-amber-300 text-amber-700 hover:text-amber-800 hover:bg-amber-100 sm:h-8"
                        >
                            <Search className="size-4" /> Search &amp; add this medicine
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-1 sm:flex-col sm:justify-center sm:gap-0.5">
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Dismiss — not a medicine"
                    className="size-11 sm:size-7 cursor-pointer text-slate-400 hover:text-rose-500"
                    onClick={onDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
