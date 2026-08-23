import { Input } from "@/components/ui/input";
import {
    PAGE_SIZES,
    isPrePrinted,
    maxHorizontalOffsetMm,
    maxVerticalOffsetMm,
    paperWindowIsUsable,
    type PageSizeId,
    type PrintPaper,
} from "@/lib/print-paper";
import { SegmentedControl } from "./header/editor/controls/control-primitives";
import PaperModeChoice from "./paper-mode-choice";
import PrePrintedPaperPreview from "./paper/preprinted-paper-preview";

// Where a doctor tells Olive what paper goes into the printer at this chamber. Most print
// onto blank paper and let Olive draw the letterhead; those who buy pre-printed pads
// measure the bands their stationery already uses and Olive prints only between them.

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
                    className="h-11 pr-10 sm:h-9"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                    mm
                </span>
            </div>
        </label>
    );
}

function PrePrintedMeasurements({ paper, printsLetterhead, onChange }: {
    paper:            PrintPaper;
    printsLetterhead: boolean;
    onChange:         (changes: Partial<PrintPaper>) => void;
}) {
    const maxVertical = maxVerticalOffsetMm(paper.pageSize);
    const maxHorizontal = maxHorizontalOffsetMm(paper.pageSize);

    // The drawing is what the numbers are checked against, so on a phone — where a row
    // would put it below the fold — it goes above them. From `sm` the row reverses and it
    // returns to the right of the fields.
    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-slate-50/60 p-3">
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-500">Page size</span>
                <SegmentedControl
                    value={paper.pageSize}
                    options={PAGE_SIZE_OPTIONS}
                    onChange={(pageSize) => onChange({ pageSize })}
                />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-start sm:gap-5">
                <PrePrintedPaperPreview paper={paper} />

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-slate-500">
                            Measure the printed bands on your pad &middot; 10 mm = 1 cm
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <OffsetInput label="Top" valueMm={paper.topMm} maxMm={maxVertical} onChange={(topMm) => onChange({ topMm })} />
                            <OffsetInput label="Bottom" valueMm={paper.bottomMm} maxMm={maxVertical} onChange={(bottomMm) => onChange({ bottomMm })} />
                            <OffsetInput label="Left" valueMm={paper.leftMm} maxMm={maxHorizontal} onChange={(leftMm) => onChange({ leftMm })} />
                            <OffsetInput label="Right" valueMm={paper.rightMm} maxMm={maxHorizontal} onChange={(rightMm) => onChange({ rightMm })} />
                        </div>
                    </div>

                    {paperWindowIsUsable(paper) ? (
                        <p className="text-xs text-slate-400">
                            Prescriptions written here print without a header or footer.
                            {printsLetterhead && " The details below still appear in the footer of your other chambers' pads."}
                        </p>
                    ) : (
                        <p className="text-xs font-medium text-rose-600">
                            These measurements leave almost no room to print into. Reduce them until the
                            clear area in the picture looks like your pad.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ChamberPaperFields({ paper, printsLetterhead = true, onChange }: {
    paper:             PrintPaper;
    printsLetterhead?: boolean;
    onChange:          (paper: PrintPaper) => void;
}) {
    const patch = (changes: Partial<PrintPaper>) => onChange({ ...paper, ...changes });

    return (
        <div className="flex flex-col gap-3">
            <PaperModeChoice value={paper.mode} onChange={(mode) => patch({ mode })} />
            {isPrePrinted(paper) && (
                <PrePrintedMeasurements paper={paper} printsLetterhead={printsLetterhead} onChange={patch} />
            )}
        </div>
    );
}
