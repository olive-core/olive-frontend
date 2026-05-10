import type { ReactNode } from "react";

interface PrescriptionPaperProps {
    header:       ReactNode;
    patientStrip: ReactNode;
    leftColumn:   ReactNode;
    rightColumn:  ReactNode;
    footer?:      ReactNode;
}

export default function PrescriptionPaper({ header, patientStrip, leftColumn, rightColumn, footer }: PrescriptionPaperProps) {
    return (
        <div className="container rounded-xl border flex flex-col mt-4 mb-12">
            <div className="m-4">
                {header}
                {patientStrip}

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
                <div className="p-4 border-t flex justify-end bg-slate-50 rounded-b-xl print:hidden">
                    {footer}
                </div>
            )}
        </div>
    );
}
