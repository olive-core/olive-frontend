import { Input } from "@/components/ui/input";
import {
    PAGE_SIZES,
    isPrePrinted,
    maxHorizontalOffsetMm,
    maxVerticalOffsetMm,
    paperWindowIsUsable,
    type PageSizeId,
    type PrintPaper,
    type PrintPaperMode,
} from "@/lib/print-paper";
import { SegmentedControl } from "./header/editor/controls/control-primitives";
import PrePrintedPaperPreview from "./paper/preprinted-paper-preview";

// Where a doctor tells Olive what paper goes into the printer at this chamber. Most
// print onto blank paper and let Olive draw the letterhead; those who buy pre-printed
// pads measure the blank window their stationery leaves and Olive prints only inside it.

const PAPER_MODE_OPTIONS: { value: PrintPaperMode; label: string }[] = [
    { value: "digital",    label: "Olive letterhead" },
    { value: "preprinted", label: "Pre-printed pad" },
];

const PAGE_SIZE_OPTIONS: { value: PageSizeId; label: string }[] = PAGE_SIZES.map((size) => ({
    value: size.id,
    label: size.label,
}));

function OffsetInput({ label, valueMm, maxMm, onChange }: {
    label:    string;
    valueMm:  number;
    maxMm:    number;
    onChange: (valueMm: number) => void;
}) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <div className="relative">
                <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={maxMm}
                    value={valueMm}
                    onFocus={(event) => event.target.select()}
                    onChange={(event) => onChange(Math.min(maxMm, Math.max(0, Number(event.target.value) || 0)))}
                    className="pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                    mm
                </span>
            </div>
        </label>
    );
}

export default function ChamberPaperFields({ paper, printsLetterhead = true, onChange }: {
    paper:             PrintPaper;
    printsLetterhead?: boolean;
    onChange:          (paper: PrintPaper) => void;
}) {
    const patch = (changes: Partial<PrintPaper>) => onChange({ ...paper, ...changes });
    const maxVertical = maxVerticalOffsetMm(paper.pageSize);
    const maxHorizontal = maxHorizontalOffsetMm(paper.pageSize);

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-slate-50/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-medium text-slate-700">Paper</p>
                    <p className="text-xs text-slate-400">
                        {isPrePrinted(paper)
                            ? "Olive prints inside your pad's blank area only"
                            : "Olive prints the full letterhead on blank paper"}
                    </p>
                </div>
                <SegmentedControl
                    value={paper.mode}
                    options={PAPER_MODE_OPTIONS}
                    onChange={(mode) => patch({ mode })}
                />
            </div>

            {isPrePrinted(paper) && (
                <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-start sm:gap-5">
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-slate-500">Page size</span>
                            <SegmentedControl
                                value={paper.pageSize}
                                options={PAGE_SIZE_OPTIONS}
                                onChange={(pageSize) => patch({ pageSize })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-slate-500">
                                Space your pad already uses &middot; 10 mm = 1 cm
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <OffsetInput label="Top" valueMm={paper.topMm} maxMm={maxVertical} onChange={(topMm) => patch({ topMm })} />
                                <OffsetInput label="Bottom" valueMm={paper.bottomMm} maxMm={maxVertical} onChange={(bottomMm) => patch({ bottomMm })} />
                                <OffsetInput label="Left" valueMm={paper.leftMm} maxMm={maxHorizontal} onChange={(leftMm) => patch({ leftMm })} />
                                <OffsetInput label="Right" valueMm={paper.rightMm} maxMm={maxHorizontal} onChange={(rightMm) => patch({ rightMm })} />
                            </div>
                        </div>

                        {paperWindowIsUsable(paper) ? (
                            <p className="text-xs text-slate-400">
                                Prescriptions written here print without a header or footer.
                                {printsLetterhead && " The pad details below still appear in the footer of your other chambers' pads."}
                            </p>
                        ) : (
                            <p className="text-xs font-medium text-rose-600">
                                These offsets leave almost no room to print into. Reduce them until the
                                clear area on the right looks like your pad.
                            </p>
                        )}
                    </div>

                    <PrePrintedPaperPreview paper={paper} />
                </div>
            )}
        </div>
    );
}
