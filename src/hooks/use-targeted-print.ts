import { useEffect, useRef, useState } from "react";

import { usePrintDocument } from "./use-print-document";

export type PrintTarget = "prescription" | "note";

interface TargetedPrintOptions {
    documentTitles: Record<PrintTarget, string>;
    onAfterPrint?:  (target: PrintTarget) => void;
}

// Lets one page keep two print-mounted documents and choose which one the next print
// captures. Requesting a target re-renders first (revealing that document's mount and
// switching the title, so the saved-PDF filename matches), then prints. The target is
// deliberately not reset after printing: iOS Safari reads the document title when it
// generates the PDF, after window.print() has already returned.
export function useTargetedPrint({ documentTitles, onAfterPrint }: TargetedPrintOptions) {
    const [request, setRequest] = useState<{ target: PrintTarget } | null>(null);
    const printTarget = request?.target ?? "prescription";

    const print = usePrintDocument({
        documentTitle: documentTitles[printTarget],
        onAfterPrint:  () => onAfterPrint?.(printTarget),
    });

    // The print callback is recreated every render; the ref keeps the effect keyed to
    // the request alone so each request prints exactly once.
    const printRef = useRef(print);
    printRef.current = print;

    useEffect(() => {
        if (request) printRef.current();
    }, [request]);

    return {
        printTarget,
        requestPrint: (target: PrintTarget) => setRequest({ target }),
    };
}
