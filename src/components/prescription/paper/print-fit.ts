import { createContext, use } from "react";

// A prescription belongs on one page. Once its content would spill onto a second sheet,
// the printed document tightens itself in fixed steps rather than wrapping: first the
// advice moves out of the doctor's way into the left column so the medicines get the
// page's full height, then the spacing closes up, then the type gets smaller, and
// finally the whole body is drawn down a few percent. That last step is what makes the
// fit robust whatever ran long — a medicine list, a history, an investigation list — and
// it is last because it is the only one that costs legibility. PrintSheet measures the
// page and climbs this ladder until the prescription fits, or runs out of steps and
// honestly takes a second page. Nothing here touches the on-screen editor — it is the
// print document's layout only.

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

// Once every layout step is spent, the only move left that always buys height is to lay
// the body out wider and draw it back down to the page's width. Below this the type stops
// being readable across a desk, and a second sheet is the honest answer.
const MIN_FIT_SCALE = 0.85;

// Ignores a scale change too small to be worth another layout pass.
const SCALE_EPSILON = 0.005;

// How tight the printed body currently is: which layout step it is on, and how far it is
// drawn down afterwards.
export interface SheetFit {
    level: number;
    scale: number;
}

export const LOOSEST_SHEET_FIT: SheetFit = { level: 0, scale: 1 };

export function printFitOf(fit: SheetFit): PrintFit {
    return PRINT_FIT_LEVELS[Math.min(fit.level, PRINT_FIT_LEVELS.length - 1)];
}

/**
 * The next tightening step, or null once the body fits or has nothing left to give.
 * `overflowRatio` is the printed height over one page's usable height.
 *
 * Every path either climbs the ladder or shrinks the scale, and both are bounded, so
 * repeated measurement always settles.
 */
export function tightenSheetFit(fit: SheetFit, overflowRatio: number): SheetFit | null {
    if (overflowRatio <= 1) return null;
    if (fit.level < PRINT_FIT_LEVELS.length - 1) return { level: fit.level + 1, scale: fit.scale };

    const scale = fit.scale / overflowRatio;
    // A drawn-down body cannot break across pages, so one that still does not fit at the
    // smallest readable size goes back to full size and takes a second sheet.
    if (scale < MIN_FIT_SCALE) return fit.scale < 1 ? { ...fit, scale: 1 } : null;

    return scale < fit.scale - SCALE_EPSILON ? { ...fit, scale } : null;
}

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
