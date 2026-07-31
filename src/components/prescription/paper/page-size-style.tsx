import { getPageSize } from "@/lib/print-paper";

const DEFAULT_PAGE = getPageSize("a4");

// Pins the printed page box to the paper the prescription is laid out for. index.css
// already declares A4, so a sheet on A4 emits nothing — that keeps the common case at
// exactly one @page rule even when a page mounts several print documents at once. Margin
// stays 0: the sheet's own insets are the margin, whether they come from the digital
// letterhead or a pre-printed pad's blank window.
export default function PageSizeStyle({ widthMm, heightMm }: { widthMm: number; heightMm: number }) {
    if (widthMm === DEFAULT_PAGE.widthMm && heightMm === DEFAULT_PAGE.heightMm) return null;

    return <style>{`@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }`}</style>;
}
