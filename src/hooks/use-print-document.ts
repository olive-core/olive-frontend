import { useEffect } from "react";

interface PrintDocumentOptions {
    documentTitle: string;
    onAfterPrint?: () => void;
}

// Prints the current page via the browser's native print dialog; the print-only markup
// is revealed by `@media print` CSS. We avoid react-to-print here because it prints a
// hidden <iframe>, which iOS Safari ignores (it prints the top window instead, producing
// a blank page). `documentTitle` becomes the saved-PDF filename and is held for the
// page's whole lifetime, not just around the print call, because iOS Safari reads the
// title when it generates the file — after window.print() has already returned.
export function usePrintDocument({ documentTitle, onAfterPrint }: PrintDocumentOptions) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = documentTitle;
        return () => {
            document.title = previousTitle;
        };
    }, [documentTitle]);

    return () => {
        const handleAfterPrint = () => {
            window.removeEventListener("afterprint", handleAfterPrint);
            onAfterPrint?.();
        };
        window.addEventListener("afterprint", handleAfterPrint);
        window.print();
    };
}
