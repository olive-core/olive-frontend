// The physical paper a prescription is printed on, and the page geometry that follows
// from it. A doctor either lets Olive print the whole letterhead onto blank paper, or
// prints onto a pad whose header, footer and side bands are already printed — and then
// Olive must lay the prescription inside the blank window the pad leaves, and print
// nothing of its own around it. This is per chamber: one pad per place they sit.

export type PrintPaperMode = "digital" | "preprinted";
export type PageSizeId = "a4" | "a5" | "letter" | "legal";

export interface PageSize {
    id:       PageSizeId;
    label:    string;
    widthMm:  number;
    heightMm: number;
}

export const PAGE_SIZES: PageSize[] = [
    { id: "a4",     label: "A4",     widthMm: 210, heightMm: 297 },
    { id: "a5",     label: "A5",     widthMm: 148, heightMm: 210 },
    { id: "letter", label: "Letter", widthMm: 216, heightMm: 279 },
    { id: "legal",  label: "Legal",  widthMm: 216, heightMm: 356 },
];

export interface PrintPaper {
    mode:     PrintPaperMode;
    pageSize: PageSizeId;
    /** Bands the pad already occupies, in millimetres. Only used in pre-printed mode. */
    topMm:    number;
    rightMm:  number;
    bottomMm: number;
    leftMm:   number;
}

// A pre-printed pad typically reserves a deep header, a shallow footer and slim side
// bands, so switching modes lands on a shape the doctor only has to adjust.
export const DEFAULT_PRINT_PAPER: PrintPaper = {
    mode:     "digital",
    pageSize: "a4",
    topMm:    50,
    rightMm:  10,
    bottomMm: 20,
    leftMm:   10,
};

// The snake_case shape persisted under a chamber's `pad_config.paper` and frozen into a
// prescription's render_config.
export interface PrintPaperApi {
    mode?:             string | null;
    page_size?:        string | null;
    margin_top_mm?:    number | null;
    margin_right_mm?:  number | null;
    margin_bottom_mm?: number | null;
    margin_left_mm?:   number | null;
}

export const PX_PER_MM = 96 / 25.4;

// A printed page needs some paper left for the prescription itself; offsets beyond these
// shares of the page would leave a window too small to print into.
const MAX_VERTICAL_SHARE = 0.6;
const MAX_HORIZONTAL_SHARE = 0.35;

export function getPageSize(pageSize: PageSizeId): PageSize {
    return PAGE_SIZES.find((size) => size.id === pageSize) ?? PAGE_SIZES[0];
}

export function maxVerticalOffsetMm(pageSize: PageSizeId): number {
    return Math.round(getPageSize(pageSize).heightMm * MAX_VERTICAL_SHARE);
}

export function maxHorizontalOffsetMm(pageSize: PageSizeId): number {
    return Math.round(getPageSize(pageSize).widthMm * MAX_HORIZONTAL_SHARE);
}

export function isPrePrinted(paper: PrintPaper): boolean {
    return paper.mode === "preprinted";
}

// Below this a pad leaves too little clear paper to print a prescription into. The
// offsets are clamped one at a time, so a doctor can still measure a top and a bottom
// band that together swallow the sheet — this is what catches that.
const MIN_WINDOW_WIDTH_MM = 90;
const MIN_WINDOW_HEIGHT_MM = 70;

/** The clear paper a pre-printed pad leaves for the prescription, in millimetres. */
export function paperWindowMm(paper: PrintPaper): { widthMm: number; heightMm: number } {
    const { widthMm, heightMm } = getPageSize(paper.pageSize);
    return {
        widthMm:  widthMm - paper.leftMm - paper.rightMm,
        heightMm: heightMm - paper.topMm - paper.bottomMm,
    };
}

export function paperWindowIsUsable(paper: PrintPaper): boolean {
    const window = paperWindowMm(paper);
    return window.widthMm >= MIN_WINDOW_WIDTH_MM && window.heightMm >= MIN_WINDOW_HEIGHT_MM;
}

function clampOffset(value: number | null | undefined, fallback: number, max: number): number {
    if (value === null || value === undefined || Number.isNaN(value)) return fallback;
    return Math.min(max, Math.max(0, value));
}

function toPageSizeId(value: unknown): PageSizeId {
    return PAGE_SIZES.some((size) => size.id === value) ? (value as PageSizeId) : DEFAULT_PRINT_PAPER.pageSize;
}

export function printPaperFromApi(api?: PrintPaperApi | null): PrintPaper {
    if (!api) return { ...DEFAULT_PRINT_PAPER };
    const pageSize = toPageSizeId(api.page_size);
    const maxVertical = maxVerticalOffsetMm(pageSize);
    const maxHorizontal = maxHorizontalOffsetMm(pageSize);
    return {
        mode:     api.mode === "preprinted" ? "preprinted" : "digital",
        pageSize,
        topMm:    clampOffset(api.margin_top_mm, DEFAULT_PRINT_PAPER.topMm, maxVertical),
        rightMm:  clampOffset(api.margin_right_mm, DEFAULT_PRINT_PAPER.rightMm, maxHorizontal),
        bottomMm: clampOffset(api.margin_bottom_mm, DEFAULT_PRINT_PAPER.bottomMm, maxVertical),
        leftMm:   clampOffset(api.margin_left_mm, DEFAULT_PRINT_PAPER.leftMm, maxHorizontal),
    };
}

export function printPaperToApi(paper: PrintPaper): PrintPaperApi {
    return {
        mode:             paper.mode,
        page_size:        paper.pageSize,
        margin_top_mm:    paper.topMm,
        margin_right_mm:  paper.rightMm,
        margin_bottom_mm: paper.bottomMm,
        margin_left_mm:   paper.leftMm,
    };
}

// Only a pre-printed pad is worth persisting; a digital pad at default A4 is what every
// chamber already prints, so it stays out of the stored config.
export function paperHasContent(paper: PrintPaper): boolean {
    return isPrePrinted(paper) || paper.pageSize !== DEFAULT_PRINT_PAPER.pageSize;
}

export interface PageInsets {
    top:    number;
    right:  number;
    bottom: number;
    left:   number;
}

export interface PrintSheetGeometry {
    pageWidthMm:  number;
    pageHeightMm: number;
    /** Edges of the page the prescription must stay clear of, in px. */
    insets: PageInsets;
    /** Breathing room between the repeating header/footer and the body, in px. */
    chromeGap: number;
}

// What the digital sheet has always used: a 24px margin with 20px at the foot, and 8px
// between the letterhead and the prescription body.
const DIGITAL_INSETS: PageInsets = { top: 24, right: 24, bottom: 20, left: 24 };
const DIGITAL_CHROME_GAP = 8;

const mmToPx = (mm: number) => mm * PX_PER_MM;

// A pre-printed pad's offsets are physical measurements of the paper, so they are used
// exactly: no extra gap is added anywhere, or the prescription would creep into a band
// the pad has already printed on.
export function printSheetGeometry(paper: PrintPaper): PrintSheetGeometry {
    const { widthMm, heightMm } = getPageSize(paper.pageSize);
    if (!isPrePrinted(paper)) {
        return { pageWidthMm: widthMm, pageHeightMm: heightMm, insets: DIGITAL_INSETS, chromeGap: DIGITAL_CHROME_GAP };
    }
    return {
        pageWidthMm:  widthMm,
        pageHeightMm: heightMm,
        insets: {
            top:    mmToPx(paper.topMm),
            right:  mmToPx(paper.rightMm),
            bottom: mmToPx(paper.bottomMm),
            left:   mmToPx(paper.leftMm),
        },
        chromeGap: 0,
    };
}
