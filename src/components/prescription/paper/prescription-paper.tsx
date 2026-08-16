import type { ReactNode } from "react";

interface PrescriptionPaperProps {
    header:       ReactNode;
    patientStrip: ReactNode;
    vitalsBar?:   ReactNode;
    leftColumn:   ReactNode;
    rightColumn:  ReactNode;
    /** The printed prescription's own footer (other chambers + Olive mark). */
    paperFooter?: ReactNode;
    /** Sticky action bar (save & print buttons); never printed. */
    footer?:      ReactNode;
}

export default function PrescriptionPaper({ header, patientStrip, vitalsBar, leftColumn, rightColumn, paperFooter, footer }: PrescriptionPaperProps) {
    return (
        // overflow-visible below `sm`: an `overflow-hidden` ancestor makes itself the scroll
        // container for anything sticky inside it, which pinned the action bar to the bottom
        // of the paper instead of the screen. Nothing here reaches the rounded corners — the
        // action bar rounds its own — so clipping is only needed from `sm` up.
        <div className="container rounded-xl border flex flex-col mt-4 mb-12 overflow-visible sm:overflow-hidden">
            <div className="m-3 sm:m-4">
                {header}
                {patientStrip}
                {vitalsBar}

                {/* The three-column split only has room for the inline editors from `lg` up. At
                    `md` (tablet portrait) the left column lands around 240px, too narrow for an
                    editor's own action row, so tablets keep the stacked full-width layout. */}
                <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="min-w-0 h-full lg:border-r lg:col-span-1 border-b lg:border-b-0 py-4 flex flex-col gap-2">
                        {leftColumn}
                    </div>

                    <div className="min-w-0 h-full col-span-1 lg:col-span-2 py-4 lg:px-8 flex flex-col justify-between">
                        {rightColumn}
                    </div>
                </div>

                {paperFooter}
            </div>

            {footer && (
                <div className="sticky bottom-0 z-20 flex items-center justify-end gap-4 rounded-b-xl border-t bg-white/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:justify-between print:hidden">
                    <span className="hidden text-xs text-slate-400 sm:block">
                        Review everything, then save &amp; print.
                    </span>
                    <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">{footer}</div>
                </div>
            )}
        </div>
    );
}
