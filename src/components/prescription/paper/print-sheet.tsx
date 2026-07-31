import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { DEFAULT_PRINT_PAPER, PX_PER_MM, printSheetGeometry, type PrintPaper } from "@/lib/print-paper";
import { PRINT_FIT_LEVELS, PrintFitContext } from "./print-fit";
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

const LAST_FIT_LEVEL = PRINT_FIT_LEVELS.length - 1;

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
    const [fitLevel, setFitLevel] = useState(0);

    const { pageWidthMm, pageHeightMm, insets, chromeGap } = printSheetGeometry(paper);

    useLayoutEffect(() => setFitLevel(0), [fitResetKey]);

    useLayoutEffect(() => {
        const measure = () => {
            const chromeHeight =
                (headerRef.current?.offsetHeight ?? 0) + (footerRef.current?.offsetHeight ?? 0);
            const usablePerPage = (pageHeightMm - PIN_SAFETY_MM) * PX_PER_MM - chromeHeight;
            if (usablePerPage <= 0) {
                setBodyMinHeight(null);
                return;
            }
            const contentHeight = contentRef.current?.offsetHeight ?? 0;
            const overflowingPx = contentHeight - MEASURE_TOLERANCE_PX - usablePerPage;

            // One step per measurement: the tighter body re-renders, this runs again on
            // the new height, and the climb stops at the first level that fits (or at the
            // last one, where the prescription honestly takes a second page).
            if (fitToOnePage && overflowingPx > 0 && fitLevel < LAST_FIT_LEVEL) {
                setFitLevel(fitLevel + 1);
                return;
            }

            const pageCount = Math.max(1, Math.ceil((contentHeight - MEASURE_TOLERANCE_PX) / usablePerPage));
            setBodyMinHeight(pageCount * usablePerPage);
        };
        measure();
        const observer = new ResizeObserver(measure);
        for (const element of [headerRef.current, footerRef.current, contentRef.current]) {
            if (element) observer.observe(element);
        }
        return () => observer.disconnect();
    }, [pageHeightMm, fitToOnePage, fitLevel]);

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
                            <div style={bodyMinHeight !== null ? { minHeight: bodyMinHeight } : undefined}>
                                <div ref={contentRef} className="flex flex-col">
                                    <PrintFitContext value={PRINT_FIT_LEVELS[fitLevel]}>
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
