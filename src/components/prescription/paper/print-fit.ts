import { createContext, use } from "react";

// A prescription belongs on one page. Once a long medicine list would spill onto a
// second sheet, the printed document tightens itself in fixed steps rather than
// wrapping: first the advice moves out of the doctor's way into the left column so the
// medicines get the page's full height, then the spacing closes up, then the type gets
// smaller. PrintSheet measures the page and climbs this ladder until the prescription
// fits, or runs out of steps and honestly takes a second page. Nothing here touches the
// on-screen editor — it is the print document's layout only.

export interface PrintFit {
    /** Advice prints under the diagnosis column instead of full width below the Rx. */
    adviceInSidebar: boolean;
    /** Section and medicine rhythm closes up. */
    tightSpacing: boolean;
    /** Type shrinks a step and the medicine's dosage-form label is dropped. */
    denseType: boolean;
}

export const PRINT_FIT_LEVELS: PrintFit[] = [
    { adviceInSidebar: false, tightSpacing: false, denseType: false },
    { adviceInSidebar: true,  tightSpacing: false, denseType: false },
    { adviceInSidebar: true,  tightSpacing: true,  denseType: false },
    { adviceInSidebar: true,  tightSpacing: true,  denseType: true  },
];

export const LOOSEST_PRINT_FIT = PRINT_FIT_LEVELS[0];

export const PrintFitContext = createContext<PrintFit>(LOOSEST_PRINT_FIT);

export function usePrintFit(): PrintFit {
    return use(PrintFitContext);
}

// Every size and gap the ladder can touch, resolved in one place so the print body stays
// plain markup and the steps stay comparable side by side.
export interface PrintFitClasses {
    columnGap:      string;
    sectionStack:   string;
    divider:        string;
    adviceDivider:  string;
    rxStack:        string;
    rxEntryPadding: string;
    listText:       string;
    medicineName:   string;
    medicineMeta:   string;
    frequency:      string;
    followUpTop:    string;
}

export function printFitClasses(fit: PrintFit): PrintFitClasses {
    return {
        columnGap:      fit.tightSpacing ? "gap-3" : "gap-4",
        sectionStack:   fit.tightSpacing ? "space-y-2" : "space-y-3",
        divider:        fit.tightSpacing ? "my-2" : "my-3",
        adviceDivider:  fit.tightSpacing ? "my-2" : "my-4",
        rxStack:        fit.tightSpacing ? "space-y-1" : "space-y-2",
        rxEntryPadding: fit.tightSpacing ? "pb-1" : "pb-2",
        listText:       fit.denseType ? "text-[11px]" : "text-xs",
        medicineName:   fit.denseType ? "text-[13px]" : "text-sm",
        medicineMeta:   fit.denseType ? "text-[11px]" : "text-xs",
        frequency:      fit.denseType ? "text-xs" : "text-sm",
        followUpTop:    fit.tightSpacing ? "mt-2" : "mt-4",
    };
}
