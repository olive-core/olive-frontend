import {
    LOOSEST_SHEET_FIT,
    PRINT_FIT_LEVELS,
    printFitOf,
    reservedBodyHeight,
    tightenSheetFit,
    type SheetFit,
} from "@/components/prescription/paper/print-fit";
import { printsOliveLetterhead } from "@/components/prescription/header/editor/letterhead-scope";
import { padFromApi } from "@/lib/chamber-pad";
import type { Chamber } from "@/types/attendant-queue";
import { printBodyMarkup } from "./markup";
import {
    DEFAULT_PRINT_PAPER,
    PX_PER_MM,
    paperWindowIsUsable,
    printPaperFromApi,
    printSheetGeometry,
    type PrintPaper,
} from "@/lib/print-paper";

let failures = 0;
const check = (label: string, passed: boolean, detail = "") => {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : `   -> ${detail}`}`);
};
const section = (title: string) => console.log(`\n${title}`);

const USABLE_PAGE_PX = 1000;
const MAX_PASSES = 40;

// PrintSheet's measure/re-render loop, with the browser replaced by a function saying how
// tall the body lays out at a given ladder level. Settling is not optional: a ladder that
// keeps asking for another step is an infinite render loop in the real document.
function settle(bodyHeightAt: (level: number) => number): { fit: SheetFit; passes: number } {
    let fit = LOOSEST_SHEET_FIT;
    for (let passes = 1; passes <= MAX_PASSES; passes++) {
        const printedHeight = bodyHeightAt(fit.level) * fit.scale;
        const tighter = tightenSheetFit(fit, printedHeight / USABLE_PAGE_PX);
        if (!tighter) return { fit, passes };
        fit = tighter;
    }
    return { fit, passes: Infinity };
}

const fixedHeight = (px: number) => () => px;
// Each layout step buys a fixed share of the body's height back.
const heightPerLevel = (px: number, savedPerLevel: number) => (level: number) => px * (1 - savedPerLevel * level);

section("1. A prescription that already fits is left alone");
{
    const { fit, passes } = settle(fixedHeight(900));
    check("stays on the roomiest layout", fit.level === 0, `level=${fit.level}`);
    check("is not drawn down", fit.scale === 1, `scale=${fit.scale}`);
    check("settles on the first measurement", passes === 1, `passes=${passes}`);
}

section("2. A body a few lines too long climbs the ladder only as far as it needs");
{
    const { fit, passes } = settle(heightPerLevel(1080, 0.06));
    check("tightens", fit.level > 0, `level=${fit.level}`);
    check("stops before the last step", fit.level < PRINT_FIT_LEVELS.length - 1, `level=${fit.level}`);
    check("does not need drawing down", fit.scale === 1, `scale=${fit.scale}`);
    check("settles quickly", passes <= 4, `passes=${passes}`);
}

section("3. A body no layout step can save is drawn down to fit");
{
    const { fit, passes } = settle(fixedHeight(1080));
    check("spends the whole ladder", fit.level === PRINT_FIT_LEVELS.length - 1, `level=${fit.level}`);
    check("is drawn down", fit.scale < 1, `scale=${fit.scale}`);
    check("stays readable", fit.scale >= 0.85, `scale=${fit.scale}`);
    check("ends up fitting the page", 1080 * fit.scale <= USABLE_PAGE_PX + 1, `printed=${1080 * fit.scale}`);
    check("settles", Number.isFinite(passes), `passes=${passes}`);
}

section("4. A prescription too long for one page takes a second, at full size");
{
    const { fit, passes } = settle(fixedHeight(1800));
    check("spends the whole ladder", fit.level === PRINT_FIT_LEVELS.length - 1, `level=${fit.level}`);
    check("goes back to full size so it can break across pages", fit.scale === 1, `scale=${fit.scale}`);
    check("settles instead of shrinking forever", Number.isFinite(passes), `passes=${passes}`);
}

section("5. Every overflow settles");
{
    let worstPasses = 0;
    let smallestScale = 1;
    for (let heightPx = 800; heightPx <= 4000; heightPx += 7) {
        const { fit, passes } = settle(fixedHeight(heightPx));
        if (!Number.isFinite(passes)) {
            check(`settles at ${heightPx}px`, false, `level=${fit.level} scale=${fit.scale}`);
            break;
        }
        worstPasses = Math.max(worstPasses, passes);
        smallestScale = Math.min(smallestScale, fit.scale);
    }
    check("no overflow loops forever", failures === 0);
    check("worst case is a handful of measurements", worstPasses <= 8, `passes=${worstPasses}`);
    check("never shrinks past the readable floor", smallestScale >= 0.85, `scale=${smallestScale}`);
}

section("6. The ladder level always resolves to a real layout");
{
    check("clamps past the last step", printFitOf({ level: 99, scale: 1 }) === PRINT_FIT_LEVELS[PRINT_FIT_LEVELS.length - 1]);
    check("the first step is the roomiest", printFitOf(LOOSEST_SHEET_FIT).adviceInSidebar === false);
    check("the last step is the densest", PRINT_FIT_LEVELS[PRINT_FIT_LEVELS.length - 1].denseType === true);
}

section("7. Paper geometry");
{
    const digital = printSheetGeometry(DEFAULT_PRINT_PAPER);
    check("digital paper keeps its own margins", digital.insets.top === 24 && digital.insets.bottom === 20);
    check("digital paper gaps the letterhead off the body", digital.chromeGap === 8);
    check("A4 by default", digital.pageWidthMm === 210 && digital.pageHeightMm === 297);

    const preprinted: PrintPaper = { ...DEFAULT_PRINT_PAPER, mode: "preprinted", topMm: 50, bottomMm: 20, leftMm: 12, rightMm: 8 };
    const pad = printSheetGeometry(preprinted);
    check("a pad's measured bands are used exactly", Math.round(pad.insets.top) === Math.round(50 * PX_PER_MM), `top=${pad.insets.top}`);
    check("nothing is added beside them", pad.chromeGap === 0);
    check("side bands are used exactly", Math.round(pad.insets.left) === Math.round(12 * PX_PER_MM));
}

section("8. Offsets that would leave no room to print are caught");
{
    check("a sane pad is usable", paperWindowIsUsable({ ...DEFAULT_PRINT_PAPER, mode: "preprinted" }));
    // Each offset is clamped on its own, so a top and a bottom band can still swallow A4.
    const swallowed = printPaperFromApi({
        mode: "preprinted", page_size: "a4", margin_top_mm: 170, margin_bottom_mm: 170, margin_left_mm: 10, margin_right_mm: 10,
    });
    check("both bands survive their own clamp", swallowed.topMm === 170 && swallowed.bottomMm === 170, JSON.stringify(swallowed));
    check("together they are rejected", !paperWindowIsUsable(swallowed));

    const narrow = printPaperFromApi({
        mode: "preprinted", page_size: "a5", margin_left_mm: 50, margin_right_mm: 50, margin_top_mm: 10, margin_bottom_mm: 10,
    });
    check("a window too narrow is rejected", !paperWindowIsUsable(narrow), JSON.stringify(narrow));
}

section("9. Long clinical text wraps instead of running into the medicines");
{
    const sidebarLevel = PRINT_FIT_LEVELS.findIndex((level) => level.adviceInSidebar);
    const markup = printBodyMarkup(sidebarLevel);
    const columns = markup.match(/class="[^"]*grid grid-cols-3[^"]*"[\s\S]*?<div class="col-span-2[^"]*"/);

    check("the advice column can shrink below its longest line", /grid grid-cols-3[^"]*"><div class="min-w-0/.test(markup), markup.slice(0, 200));
    check("the medicines column can too", /class="col-span-2 min-w-0"/.test(markup), String(columns !== null));
    check("advice breaks mid-word rather than overflowing", /list-disc space-y-1 pl-5 break-words/.test(markup));
    check("section lists break too", /list-disc pl-4 break-words/.test(markup));
    check("a long medicine name cannot push the frequency off", /min-w-0 flex-1 break-words/.test(markup));
}

section("10. The pad editor only offers what will actually be printed");
{
    const chamber = (id: string) => ({ chamber_id: id }) as Chamber;
    const digital = padFromApi({ paper: { mode: "digital" } });
    const preprinted = padFromApi({ paper: { mode: "preprinted" } });

    check("a doctor with no chambers still prints Olive's letterhead", printsOliveLetterhead([], {}));
    check("so does a doctor on blank paper", printsOliveLetterhead([chamber("a")], { a: digital }));
    check("a mixed doctor still needs the letterhead", printsOliveLetterhead([chamber("a"), chamber("b")], { a: preprinted, b: digital }));
    check("pre-printed everywhere prints none of it", !printsOliveLetterhead([chamber("a"), chamber("b")], { a: preprinted, b: preprinted }));
    check("a pad that has not loaded is not read as pre-printed", printsOliveLetterhead([chamber("a")], {}));
}

section("11. A complaint prints its details, not just its label");
{
    const markup = printBodyMarkup(0);

    check("the complaint's note prints", markup.includes("Persistent vomiting \u00d7 4 days following fall."), markup.slice(0, 200));
    check("a typed timeline prints beside the name", markup.includes("\u2014 3 days"));
    check("the history's note prints", markup.includes("On amlodipine 5mg for six years."));
    check("an empty timeline prints nothing", !/>\s*\u2014\s*</.test(markup));
    check("a complaint and its note stay on one page", /<li class="break-inside-avoid">/.test(markup));

    // An investigation's Clinical Notes box is stored as `reason`. A clinician who types
    // "fasting sample" there must see it on the paper, so the note prints whatever wrote it.
    check("the investigation itself prints", markup.includes("CBC with ESR"));
    check("an investigation's note prints", markup.includes("To evaluate febrile illness."));
    check("an investigation with no note prints just its name", markup.includes("Serum creatinine"));
    check("and gains no empty detail line", !/Serum creatinine<span class="block/.test(markup));

    // The detail line has to tighten with everything else, or it is what pushes a
    // prescription onto a second sheet.
    const densest = printBodyMarkup(PRINT_FIT_LEVELS.length - 1);
    check("the detail line shrinks on the densest step", densest.includes("text-[10px]"), "no dense detail class");
    check("and is roomier on the loosest", markup.includes("text-[11px]"), "no loose detail class");
}

section("12. The body's reservation never outgrows the page the browser prints on");
{
    // The browser resolves the CSS; here `100vh` is swapped for the page area it would use.
    const resolve = (css: string, pageAreaPx: number) =>
        Function(`return ${css
            .replace(/100vh/g, String(pageAreaPx))
            .replace(/px/g, "")
            .replace(/calc/g, "")
            .replace(/max\(/g, "Math.max(")
            .replace(/min\(/g, "Math.min(")};`)() as number;

    const A4_PX = 297 * PX_PER_MM;
    const SAFETY_PX = 6 * PX_PER_MM;
    const CHROME_PX = 360;
    const usable = A4_PX - SAFETY_PX - CHROME_PX;
    const one = reservedBodyHeight(1, usable, CHROME_PX + SAFETY_PX);

    check("on the exact page, a whole page is reserved as before",
        Math.abs(resolve(one, A4_PX) - usable) < 0.01, `${resolve(one, A4_PX)} vs ${usable}`);

    // Chrome's "Minimum" margins, a printer's insets, AirPrint: all take a few millimetres.
    for (const marginMm of [3, 5, 10]) {
        const pageArea = A4_PX - 2 * marginMm * PX_PER_MM;
        const sheet = CHROME_PX + resolve(one, pageArea);
        check(`${marginMm}mm print margins keep a one-page prescription on one page`,
            sheet <= pageArea, `sheet ${sheet.toFixed(1)} > page ${pageArea.toFixed(1)}`);
        check(`and the footer still sits just above the bottom edge (${marginMm}mm)`,
            Math.abs(pageArea - sheet - SAFETY_PX) < 0.01, `gap ${(pageArea - sheet).toFixed(1)}`);
    }

    const two = reservedBodyHeight(2, usable, CHROME_PX + SAFETY_PX);
    check("two pages reserve two pages' body on the exact page",
        Math.abs(resolve(two, A4_PX) - 2 * usable) < 0.01);
    check("and two smaller pages' body on a smaller one",
        resolve(two, A4_PX - 40) < 2 * usable && resolve(two, A4_PX - 40) > 2 * (usable - 40.01));

    // A drawn-down body is out of flow; the reservation must hold its whole height open,
    // or it would run into the footer.
    const drawn = reservedBodyHeight(1, usable, CHROME_PX + SAFETY_PX, usable + 1.5);
    check("a drawn-down body keeps its own height", resolve(drawn, A4_PX) === usable + 1.5);

    // On screen `100vh` is the phone's viewport, which can be shorter than the letterhead.
    check("never negative on a short screen", resolve(one, 300) === 0);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
