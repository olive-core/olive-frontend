import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { DEFAULT_PRINT_PAPER, PX_PER_MM, printSheetGeometry, type PrintPaper } from "@/lib/print-paper";
import {
    LOOSEST_SHEET_FIT,
    PrintFitContext,
    printFitOf,
    tightenSheetFit,
    type SheetFit,
} from "./print-fit";
import PageSizeStyle from "./page-size-style";

// One printed prescription sheet. The header and footer live in <thead>/<tfoot>, which
// browsers repeat at the top and bottom of every printed page — so a long prescription
// carries the letterhead and footer on each page, always in the same position. The body
// reserves whole pages of the remaining height (measured, since letterheads vary per
// doctor): one page for a short prescription so the footer pins to the bottom edge of
// page 1, two pages once the content spills over, and so on — otherwise the last page's
// footer would float directly under the content. Page size and edge offsets come from
// the chamber's paper setup — a pre-printed pad reserves its printed bands the same way
// a letterhead reserves its own height. The .rx-print-mount wrapper keeps this laid out
// (height 0) on screen so the measurements are real before the print dialog opens.

const PIN_SAFETY_MM = 6;

// Forgives sub-pixel measurement noise so content that fits a page to the pixel doesn't
// reserve a spurious extra page.
const MEASURE_TOLERANCE_PX = 2;

// A body drawn down to fit lays out wider and is scaled back to the page's width, and is
// taken out of flow so its full-size height stops pushing the footer onto a second sheet:
// the reserved page height around it is what the footer sits below.
function scaledBodyStyle(scale: number): CSSProperties | undefined {
    if (scale >= 1) return undefined;
    return {
        position:        "absolute",
        top:             0,
        left:            0,
        width:           `${100 / scale}%`,
        transform:       `scale(${scale})`,
        transformOrigin: "top left",
    };
}

interface PrintSheetProps {
    header:   ReactNode;
    footer:   ReactNode;
    children: ReactNode;
    paper?:   PrintPaper;
    /** Tighten the body a step at a time while it would spill onto a second page. */
    fitToOnePage?: boolean;
    /** Changing this lets the body try the roomiest layout again (see PRINT_FIT_LEVELS). */
    fitResetKey?: string;
}

export default function PrintSheet({
    header,
    footer,
    children,
    paper = DEFAULT_PRINT_PAPER,
    fitToOnePage = false,
    fitResetKey,
}: PrintSheetProps) {
    const headerRef = useRef<HTMLTableCellElement>(null);
    const footerRef = useRef<HTMLTableCellElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [bodyMinHeight, setBodyMinHeight] = useState<number | null>(null);
    const [fit, setFit] = useState<SheetFit>(LOOSEST_SHEET_FIT);

    const { pageWidthMm, pageHeightMm, insets, chromeGap } = printSheetGeometry(paper);

    useLayoutEffect(() => setFit(LOOSEST_SHEET_FIT), [fitResetKey]);

    useLayoutEffect(() => {
        const measure = () => {
            const chromeHeight =
                (headerRef.current?.offsetHeight ?? 0) + (footerRef.current?.offsetHeight ?? 0);
            const usablePerPage = (pageHeightMm - PIN_SAFETY_MM) * PX_PER_MM - chromeHeight;
            if (usablePerPage <= 0) {
                setBodyMinHeight(null);
                return;
            }
            // offsetHeight ignores the scale transform, so this is the body's full-size
            // layout height; what lands on paper is that height drawn down.
            const printedHeight = (contentRef.current?.offsetHeight ?? 0) * fit.scale - MEASURE_TOLERANCE_PX;

            // One step per measurement: the tighter body re-renders, this runs again on
            // the new height, and the climb stops at the first step that fits (or once
            // the ladder is spent, where the prescription honestly takes a second page).
            if (fitToOnePage) {
                const tighter = tightenSheetFit(fit, printedHeight / usablePerPage);
                if (tighter) {
                    setFit(tighter);
                    return;
                }
            }

            const pageCount = Math.max(1, Math.ceil(printedHeight / usablePerPage));
            setBodyMinHeight(pageCount * usablePerPage);
        };
        measure();
        const observer = new ResizeObserver(measure);
        for (const element of [headerRef.current, footerRef.current, contentRef.current]) {
            if (element) observer.observe(element);
        }
        return () => observer.disconnect();
    }, [pageHeightMm, fitToOnePage, fit]);

    return (
        <>
            <PageSizeStyle widthMm={pageWidthMm} heightMm={pageHeightMm} />
            <table className="mx-auto table-fixed bg-white text-sm" style={{ width: `${pageWidthMm}mm` }}>
                <thead>
                    <tr>
                        <td
                            ref={headerRef}
                            className="align-top"
                            style={{
                                paddingTop:    insets.top,
                                paddingLeft:   insets.left,
                                paddingRight:  insets.right,
                                paddingBottom: chromeGap,
                            }}
                        >
                            {header}
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="align-top" style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
                            <div
                                className="relative"
                                style={bodyMinHeight !== null ? { minHeight: bodyMinHeight } : undefined}
                            >
                                <div ref={contentRef} className="flex flex-col" style={scaledBodyStyle(fit.scale)}>
                                    <PrintFitContext value={printFitOf(fit)}>
                                        {children}
                                    </PrintFitContext>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td
                            ref={footerRef}
                            className="align-bottom"
                            style={{
                                paddingTop:    chromeGap,
                                paddingLeft:   insets.left,
                                paddingRight:  insets.right,
                                paddingBottom: insets.bottom,
                            }}
                        >
                            {footer}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </>
    );
}
