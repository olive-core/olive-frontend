import type { ReactNode } from "react";

import type { ResolvedLetterhead } from "@/lib/header-config";
import { DEFAULT_PRINT_PAPER, isPrePrinted, type PrintPaper } from "@/lib/print-paper";
import { ResolvedPrescriptionHeader } from "../header/clinician-prescription-header";
import PrescriptionFooter from "../footer/prescription-footer";
import PrintSheet from "./print-sheet";
import PrescriptionPrintBody from "./prescription-print-body";

// The one printed prescription document, shared by the in-session draft and the saved
// consultation views so the two printouts can never drift apart. `data` is the
// prescription payload shape both already share (chief_complaints, rx_list, ...).
// `paper` is the physical pad it is going onto: a pre-printed pad already carries the
// letterhead and the footer, so Olive prints neither and stays inside the pad's blank
// window. Callers pass it explicitly, because who is printing decides it — a patient
// printing at home has plain paper, whatever pad the doctor used.

interface PrescriptionPrintDocumentProps {
    letterhead:        ResolvedLetterhead | null;
    paper?:            PrintPaper;
    data:              Record<string, any>;
    patientSlot:       ReactNode;
    followUpBaseDate?: string;
}

// Adding or removing an entry is what moves a prescription across the page boundary, so
// the counts are what release PrintSheet to try the roomiest layout again.
function contentSignature(data: Record<string, any>): string {
    return [
        data.chief_complaints,
        data.histories,
        data.diagnoses,
        data.investigations,
        data.rx_list,
        data.advice_list,
    ]
        .map((list) => (list ?? []).length)
        .join("-");
}

export default function PrescriptionPrintDocument({
    letterhead,
    paper = DEFAULT_PRINT_PAPER,
    data,
    patientSlot,
    followUpBaseDate,
}: PrescriptionPrintDocumentProps) {
    const printsLetterhead = letterhead !== null && !isPrePrinted(paper);

    return (
        <PrintSheet
            paper={paper}
            fitToOnePage
            fitResetKey={contentSignature(data)}
            header={
                <>
                    {printsLetterhead && <ResolvedPrescriptionHeader letterhead={letterhead} />}
                    {patientSlot}
                </>
            }
            footer={printsLetterhead && <PrescriptionFooter footer={letterhead.footer} config={letterhead.config} />}
        >
            <PrescriptionPrintBody data={data} followUpBaseDate={followUpBaseDate} />
        </PrintSheet>
    );
}
