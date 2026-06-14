import type { ReactNode } from "react";

interface PrescriptionPaperProps {
    header:       ReactNode;
    patientStrip: ReactNode;
    vitalsBar?:   ReactNode;
    leftColumn:   ReactNode;
    rightColumn:  ReactNode;
    footer?:      ReactNode;
}

export default function PrescriptionPaper({ header, patientStrip, vitalsBar, leftColumn, rightColumn, footer }: PrescriptionPaperProps) {
    return (
        <div className="container rounded-xl border flex flex-col mt-4 mb-12">
            <div className="m-4">
                {header}
                {patientStrip}
                {vitalsBar}

                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="h-full md:border-r md:col-span-1 border-b md:border-b-0 py-4 flex flex-col gap-2">
                        {leftColumn}
                    </div>

                    <div className="h-full col-span-1 md:col-span-2 py-4 px-4 md:px-8 flex flex-col justify-between">
                        {rightColumn}
                    </div>
                </div>
            </div>

            {footer && (
                <div className="sticky bottom-0 z-20 flex items-center justify-end gap-4 rounded-b-xl border-t bg-white/85 px-4 py-3 backdrop-blur sm:justify-between print:hidden">
                    <span className="hidden text-xs text-slate-400 sm:block">
                        Review everything, then save &amp; print.
                    </span>
                    {footer}
                </div>
            )}
        </div>
    );
}
