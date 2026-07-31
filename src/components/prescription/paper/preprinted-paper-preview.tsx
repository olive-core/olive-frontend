import { getPageSize, type PrintPaper } from "@/lib/print-paper";

// A scale drawing of the doctor's pre-printed pad: the shaded bands are what their
// stationery already prints on, the clear window in the middle is where Olive puts the
// prescription. Measuring a pad with a ruler is easier to trust when the numbers you
// type redraw the sheet.

interface PrePrintedPaperPreviewProps {
    paper:   PrintPaper;
    /** Rendered height of the page drawing, in px. */
    heightPx?: number;
}

export default function PrePrintedPaperPreview({ paper, heightPx = 190 }: PrePrintedPaperPreviewProps) {
    const { widthMm, heightMm, label } = getPageSize(paper.pageSize);
    const scale = heightPx / heightMm;
    const percent = (mm: number, total: number) => `${(mm / total) * 100}%`;

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div
                className="relative overflow-hidden rounded-sm border bg-slate-100 shadow-sm"
                style={{ width: widthMm * scale, height: heightPx }}
            >
                <div
                    className="absolute flex items-center justify-center border border-dashed border-emerald-400 bg-white"
                    style={{
                        top:    percent(paper.topMm, heightMm),
                        bottom: percent(paper.bottomMm, heightMm),
                        left:   percent(paper.leftMm, widthMm),
                        right:  percent(paper.rightMm, widthMm),
                    }}
                >
                    <span className="px-1 text-center text-[9px] font-medium leading-tight text-emerald-600">
                        Prescription
                    </span>
                </div>
            </div>
            <p className="text-[10px] text-slate-400">
                {label} &middot; {widthMm} &times; {heightMm} mm
            </p>
        </div>
    );
}
