import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// One printed prescription sheet. The header and footer live in <thead>/<tfoot>, which
// browsers repeat at the top and bottom of every printed page — so a long prescription
// carries the letterhead and footer on each page, always in the same position. The body
// reserves whole pages of the remaining height (measured, since letterheads vary per
// doctor): one page for a short prescription so the footer pins to the bottom edge of
// page 1, two pages once the content spills over, and so on — otherwise the last page's
// footer would float directly under the content. Geometry assumes the fixed A4 full-bleed
// @page in index.css; the .rx-print-mount wrapper keeps this laid out (height 0) on
// screen so the measurements are real before the print dialog opens.

const PAGE_HEIGHT_MM = 297;
const PIN_SAFETY_MM = 6;
const PX_PER_MM = 96 / 25.4;

// Forgives sub-pixel measurement noise so content that fits a page to the pixel doesn't
// reserve a spurious extra page.
const MEASURE_TOLERANCE_PX = 2;

interface PrintSheetProps {
    header:   ReactNode;
    footer:   ReactNode;
    children: ReactNode;
}

export default function PrintSheet({ header, footer, children }: PrintSheetProps) {
    const headerRef = useRef<HTMLTableCellElement>(null);
    const footerRef = useRef<HTMLTableCellElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [bodyMinHeight, setBodyMinHeight] = useState<number | null>(null);

    useLayoutEffect(() => {
        const measure = () => {
            const chromeHeight =
                (headerRef.current?.offsetHeight ?? 0) + (footerRef.current?.offsetHeight ?? 0);
            const usablePerPage = (PAGE_HEIGHT_MM - PIN_SAFETY_MM) * PX_PER_MM - chromeHeight;
            if (usablePerPage <= 0) {
                setBodyMinHeight(null);
                return;
            }
            const contentHeight = contentRef.current?.offsetHeight ?? 0;
            const pageCount = Math.max(1, Math.ceil((contentHeight - MEASURE_TOLERANCE_PX) / usablePerPage));
            setBodyMinHeight(pageCount * usablePerPage);
        };
        measure();
        const observer = new ResizeObserver(measure);
        for (const element of [headerRef.current, footerRef.current, contentRef.current]) {
            if (element) observer.observe(element);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <table className="mx-auto w-[210mm] table-fixed bg-white text-sm">
            <thead>
                <tr>
                    <td ref={headerRef} className="px-6 pb-2 pt-6 align-top">
                        {header}
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="px-6 align-top">
                        <div style={bodyMinHeight !== null ? { minHeight: bodyMinHeight } : undefined}>
                            <div ref={contentRef} className="flex flex-col">
                                {children}
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td ref={footerRef} className="px-6 pb-5 pt-2 align-bottom">
                        {footer}
                    </td>
                </tr>
            </tfoot>
        </table>
    );
}
