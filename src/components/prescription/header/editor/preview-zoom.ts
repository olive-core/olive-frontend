// 210mm at CSS 96dpi — the paper's true layout width. The preview always lays out at this
// width, so line wrapping matches print exactly, and is transformed to fit its pane.
export const PAPER_PX = 794;

// Fitting A4 into a phone leaves the type at roughly a third of its printed size: enough to
// judge the layout, far too small to read. Actual size stays available wherever the pane is
// too narrow to show the whole page, and pans sideways instead.
export type PreviewZoom = "fit" | "actual";

export interface PreviewFit {
    /** Where the pane is at least as wide as the paper there is nothing to zoom to. */
    canZoom: boolean;
    scale:   number;
}

export function previewFit(paneWidth: number, zoom: PreviewZoom): PreviewFit {
    const fitScale = paneWidth > 0 ? Math.min(1, paneWidth / PAPER_PX) : 1;
    const canZoom = fitScale < 1;
    return { canZoom, scale: canZoom && zoom === "actual" ? 1 : fitScale };
}
