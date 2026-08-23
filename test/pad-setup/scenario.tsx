import { act, type ReactNode } from "react";
import { BuildingIcon } from "lucide-react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DEFAULT_PRINT_PAPER } from "@/lib/print-paper";
import { padFromApi } from "@/lib/chamber-pad";
import type { Chamber } from "@/types/attendant-queue";
import { useAuthStore } from "@/stores/auth-store";
import {
    chamberIdFromSection,
    chamberSectionId,
    parsePadSectionId,
    useHeaderConfigStore,
} from "@/stores/header-config-store";
import { chamberSectionSummary, doctorSectionSummary, sectionForFocusKey } from "@/components/prescription/header/editor/pad-sections";
import { setupStages } from "@/components/prescription/header/editor/pad-setup-stages";
import { PAPER_PX, previewFit } from "@/components/prescription/header/editor/preview-zoom";
import PadSectionList from "@/components/prescription/header/editor/pad-section-list";
import PadPreviewSheet from "@/components/prescription/header/editor/preview-sheet";
import PadSetupWizard from "@/components/prescription/header/editor/pad-setup-wizard";
import ChamberPadFields from "@/components/prescription/chamber-pad-fields";
import ChamberPaperFields from "@/components/prescription/chamber-paper-fields";
import LayoutStyleControls from "@/components/prescription/header/editor/controls/layout-style-controls";
import { Accordion } from "@/components/ui/accordion";
import PadSection from "@/components/prescription/header/editor/pad-section";
import WizardFrame from "@/components/prescription/header/editor/wizard-frame";
import { viewport } from "./dom-setup";

let failures = 0;
const check = (label: string, passed: boolean, detail = "") => {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : `   -> ${detail}`}`);
};
const section = (title: string) => console.log(`\n${title}`);

const PRE_PRINTED_PAD = { paper: { mode: "preprinted", page_size: "a4" } };

function chamberFixture(id: string, hospital: string, padConfig?: Chamber["pad_config"]): Chamber {
    return {
        chamber_id:   id,
        clinician_id: "doctor-1",
        hospital_name: hospital,
        room_no:      "402",
        pad_config:   padConfig ?? null,
    };
}

function seedEditor(chambers: Chamber[]) {
    const store = useHeaderConfigStore.getState();
    store.reset();
    store.hydratePads(chambers);
}

function withQueryClient(node: ReactNode) {
    return (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            {node}
        </QueryClientProvider>
    );
}

function mount(node: ReactNode): { root: Root; host: HTMLElement } {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => root.render(withQueryClient(node)));
    return { root, host };
}

const textsOf = (host: HTMLElement, selector: string) =>
    [...host.querySelectorAll(selector)].map((node) => node.textContent ?? "");

const hasText = (host: HTMLElement, selector: string, needle: string) =>
    textsOf(host, selector).some((text) => text.includes(needle));

const clickText = (host: HTMLElement, selector: string, needle: string) => {
    const target = [...host.querySelectorAll(selector)].find((node) => (node.textContent ?? "").includes(needle));
    act(() => target?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
    return Boolean(target);
};

// Tailwind variants are prefixed (`sm:h-9`); an unprefixed class is what a phone gets.
const inputClassLists = (markup: string): string[][] =>
    [...markup.matchAll(/<input\b[^>]*>/g)].map((match) => {
        const className = /class="([^"]*)"/.exec(match[0]);
        return className ? className[1].split(/\s+/).filter(Boolean) : [];
    });

const unprefixed = (classes: string[]) => classes.filter((name) => !name.includes(":"));

// Controls whose phone height is pinned small by a class rather than left to their content.
// A range slider is exempt: the browser sizes its thumb, and a 44px track would be absurd.
const PINNED_SMALL = /^(h|size)-([1-9]|10|1\.5|2\.5)$/;
const TAP_TARGET_FLOOR = /^min-h-(11|12|14|16)$/;

function controlsPinnedBelowTapTarget(markup: string): string[] {
    const tooSmall: string[] = [];
    for (const match of markup.matchAll(/<(button|input|textarea|a)\b([^>]*)>/g)) {
        if (/type="hidden"|\bhidden\b|type="range"/.test(match[2])) continue;
        const all = (/class="([^"]*)"/.exec(match[2])?.[1] ?? "").split(/\s+/).filter(Boolean);
        // A switch keeps its 24px track and reaches the tap target with a pseudo-element.
        if (all.some((name) => name.startsWith("before:-inset-y-"))) continue;
        const phone = unprefixed(all);
        // min-height wins over height, so it rescues a component's own small base size.
        if (phone.some((name) => TAP_TARGET_FLOOR.test(name))) continue;
        if (phone.some((name) => PINNED_SMALL.test(name))) {
            tooSmall.push((/aria-label="([^"]*)"/.exec(match[2])?.[1]) ?? match[1]);
        }
    }
    return tooSmall;
}

export async function runTest() {
    useAuthStore.setState({ userId: "doctor-1" });

    // -----------------------------------------------------------------------
    section("A click on the paper reaches the section that owns the field");
    {
        check("the doctor's own fields belong to Your details",
            sectionForFocusKey("qualification", "chamber-1").section === "doctor");
        check("the logo and the medical symbol belong to Look of the pad",
            sectionForFocusKey("logo", "chamber-1").section === "style"
            && sectionForFocusKey("medicalSymbol", null).section === "style");
        check("a chamber's name belongs to that chamber's own section",
            sectionForFocusKey("chamberName", "chamber-1").section === chamberSectionId("chamber-1"));
        check("the chamber name maps to the pad's name field",
            sectionForFocusKey("chamberName", "chamber-1").targetKey === "pad-chamber-1-name");
        check("a contact line belongs to the previewed chamber",
            sectionForFocusKey("contact-abc", "chamber-2").section === chamberSectionId("chamber-2"));
        check("a footer row belongs to Bottom of the page, not to the chamber",
            sectionForFocusKey("footer-chamber-9", "chamber-1").section === "footer");
        check("with no chamber previewed a contact line falls back to Your details",
            sectionForFocusKey("contact-abc", null).section === "doctor");
    }

    // -----------------------------------------------------------------------
    section("A section id survives a deep link and nothing else does");
    {
        check("a chamber section round-trips through the URL",
            chamberIdFromSection(chamberSectionId("chamber-7")) === "chamber-7");
        check("a global section has no chamber", chamberIdFromSection("style") === null);
        check("the old tab names are no longer accepted", parsePadSectionId("chambers") === undefined);
        check("junk in the URL is dropped", parsePadSectionId(42) === undefined);
        check("a chamber section is accepted",
            parsePadSectionId(chamberSectionId("chamber-7")) === chamberSectionId("chamber-7"));
        check("every global section is accepted",
            ["doctor", "style", "footer"].every((id) => parsePadSectionId(id) === id));
    }

    // -----------------------------------------------------------------------
    section("A collapsed section says what it currently holds");
    {
        check("a pre-printed chamber names the paper, not a missing letterhead",
            chamberSectionSummary(padFromApi(PRE_PRINTED_PAD)) === "Your own printed pad · A4");
        check("a brand new chamber says nothing is filled in",
            chamberSectionSummary(padFromApi(null)).includes("nothing added yet"));
        check("a filled chamber says Olive prints the letterhead",
            chamberSectionSummary(padFromApi({ display_name: "Ibn Sina" })) === "Olive prints the letterhead");
        check("an empty doctor block says so",
            doctorSectionSummary({ name: "", qualification: "", bmdcNo: "" }, "") === "Nothing added yet");
        check("a filled doctor block reads back what will print",
            doctorSectionSummary({ name: "Dr. Ahsan", qualification: "MBBS", bmdcNo: "A-1" }, "Medicine")
                === "Dr. Ahsan · MBBS · Medicine");
    }

    // -----------------------------------------------------------------------
    section("The first run asks the paper question, and stops asking once answered");
    {
        check("blank paper still needs the doctor's details",
            setupStages(DEFAULT_PRINT_PAPER).join(",") === "place,paper,details");
        check("a pre-printed pad ends the flow at the paper",
            setupStages({ ...DEFAULT_PRINT_PAPER, mode: "preprinted" }).join(",") === "place,paper");
        check("before a chamber exists the flow still promises the details step",
            setupStages(undefined).join(",") === "place,paper,details");
    }

    // -----------------------------------------------------------------------
    section("A doctor with no pad is asked where they practise first");
    {
        seedEditor([]);
        const { root, host } = mount(
            <PadSetupWizard isSaving={false} onSave={async () => {}} onFinish={() => {}} />,
        );

        check("step one is the place, not the letterhead",
            hasText(host, "h1", "Where do you write prescriptions?"));
        check("the doctor is told how many questions there are",
            hasText(host, "span", "Step 1 of 3"));
        check("the flow can be left without answering", hasText(host, "button", "Skip for now"));

        act(() => root.unmount());
    }

    // -----------------------------------------------------------------------
    section("The editor is one flat list, not a set of tabs");
    {
        seedEditor([chamberFixture("chamber-1", "Ibn Sina"), chamberFixture("chamber-2", "Popular")]);
        const { root, host } = mount(<PadSectionList />);

        check("there is no tab bar left to guess at", host.querySelectorAll('[role="tab"]').length === 0);
        check("every chamber is a section of its own",
            hasText(host, "button", "Ibn Sina") && hasText(host, "button", "Popular"));
        check("adding a chamber is offered in the list itself",
            hasText(host, "button", "Add a chamber"));
        check("the letterhead sections are named in plain words",
            hasText(host, "button", "Your details")
            && hasText(host, "button", "Look of the pad")
            && hasText(host, "button", "Bottom of the page"));
        check("an unfilled section says so on its own row",
            hasText(host, "span", "Not filled in yet"));

        check("opening a chamber asks about the paper before anything else",
            clickText(host, "button", "Ibn Sina") && hasText(host, "h3", "What paper do you print on?"));
        check("both kinds of paper are offered as a choice",
            host.querySelectorAll('[role="radio"]').length >= 2
            && hasText(host, "button", "My own printed pad"));

        act(() => root.unmount());
    }

    // -----------------------------------------------------------------------
    section("A doctor who only uses pre-printed pads is asked nothing about a letterhead");
    {
        seedEditor([chamberFixture("chamber-1", "Ibn Sina", PRE_PRINTED_PAD)]);
        const { root, host } = mount(<PadSectionList />);

        check("the chamber is still there", hasText(host, "button", "Ibn Sina"));
        check("Your details is gone", !hasText(host, "button", "Your details"));
        check("Look of the pad is gone", !hasText(host, "button", "Look of the pad"));
        check("Bottom of the page is gone", !hasText(host, "button", "Bottom of the page"));
        check("the pre-printed chamber is not nagged as unfilled",
            !hasText(host, "span", "Not filled in yet"));

        act(() => root.unmount());
    }

    // -----------------------------------------------------------------------
    section("On a phone the preview is asked for by name, not fighting for the screen");
    {
        viewport.isPhone = true;
        seedEditor([chamberFixture("chamber-1", "Ibn Sina")]);
        const { root, host } = mount(<PadPreviewSheet />);

        check("a labelled Preview button is what the doctor sees", hasText(host, "button", "Preview"));
        check("the paper takes none of the form's screen until it is asked for",
            !document.body.textContent?.includes("Tap any text on the paper"));

        clickText(host, "button", "Preview");
        check("opening it shows the paper", Boolean(document.body.textContent?.includes("Tap any text on the paper")));
        // A flex child will not shrink below its content without min-h-0, and the sheet
        // then overflows the screen instead of scrolling inside its own height.
        check("the sheet scrolls instead of overflowing",
            Boolean(document.querySelector('[data-slot="sheet-content"] .min-h-0.flex-1.overflow-y-auto')));

        act(() => root.unmount());
        viewport.isPhone = false;
    }

    // -----------------------------------------------------------------------
    // These two cost a doctor the right-hand edge of the page: content sized itself to its
    // longest line and was clipped, with no scrollbar to hint anything was missing. jsdom
    // cannot lay that out — `npm run probe:phone` measures it in a real browser — so what is
    // pinned here is the CSS contract that made it possible.
    section("The page cannot size itself to its content instead of the screen");
    {
        const sectionMarkup = renderToStaticMarkup(
            <Accordion type="single" collapsible>
                <PadSection id="doctor" icon={BuildingIcon} title="A very long chamber name" summary="x">
                    <span>body</span>
                </PadSection>
            </Accordion>,
        );
        // A flex item defaults to min-width:auto and refuses to shrink below its min-content
        // — and a `truncate` summary's min-content is the whole string, unwrapped.
        check("the section header may shrink below its longest line",
            /<button[^>]*class="[^"]*\bmin-w-0\b/.test(sectionMarkup));

        const frameMarkup = renderToStaticMarkup(
            <WizardFrame stepNumber={1} stepCount={3} title="t" description="d" onSkip={() => {}}>
                <span>body</span>
            </WizardFrame>,
        );
        // `mx-auto` gives a flex item auto cross-axis margins, which suppress the stretch
        // that would size it to the screen; without w-full it falls back to max-content.
        check("a centred page container still takes the width of the screen",
            /class="[^"]*mx-auto[^"]*w-full[^"]*"/.test(frameMarkup));
    }

    // -----------------------------------------------------------------------
    section("Nothing in the pad editor is too small for a thumb");
    {
        const markup =
            renderToStaticMarkup(withQueryClient(
                <ChamberPadFields
                    chamberId="chamber-1"
                    chamberLabel="Ibn Sina"
                    pad={padFromApi({
                        contact_lines: [{ id: "a", kind: "custom", label: "Web", value: "x" }],
                        paper: { mode: "preprinted" },
                    })}
                    onChange={() => {}}
                />,
            )) + renderToStaticMarkup(withQueryClient(<LayoutStyleControls />));

        const tooSmall = controlsPinnedBelowTapTarget(markup);
        check("every control is either 44px or sized by its own content",
            tooSmall.length === 0, tooSmall.join(", "));
        check("the switches keep a small track but a full-size tap area",
            markup.includes("before:-inset-y-2.5"));
    }

    // -----------------------------------------------------------------------
    section("A page too wide for the screen can still be read");
    {
        const phonePane = previewFit(320, "fit");
        check("a phone shrinks the page to fit", phonePane.scale < 0.5 && phonePane.canZoom);
        check("and offers to show it at printed size",
            previewFit(320, "actual").scale === 1);
        check("a pane wider than the paper needs no zoom at all",
            !previewFit(PAPER_PX + 200, "fit").canZoom
            && previewFit(PAPER_PX + 200, "actual").scale === 1);
        check("an unmeasured pane does not flash the page at full size",
            previewFit(0, "fit").scale === 1 && !previewFit(0, "fit").canZoom);
    }

    // -----------------------------------------------------------------------
    section("The pad measurements read top-to-bottom on a phone");
    {
        const markup = renderToStaticMarkup(
            <ChamberPaperFields
                paper={{ mode: "preprinted", pageSize: "a4", topMm: 50, rightMm: 10, bottomMm: 20, leftMm: 10 }}
                onChange={() => {}}
            />,
        );
        check("the drawing comes before the numbers it is checked against",
            markup.indexOf("Prescription</span>") < markup.indexOf("Measure the printed bands"));
        check("the drawing returns to the side once there is room",
            markup.includes("sm:flex-row-reverse"));
        check("four page sizes wrap rather than run off the screen",
            markup.includes("flex-wrap") && markup.includes("Legal"));
    }

    // -----------------------------------------------------------------------
    section("Every field of a pad can be typed into on a phone");
    {
        const markup = renderToStaticMarkup(
            withQueryClient(
                <ChamberPadFields
                    chamberId="chamber-1"
                    chamberLabel="Ibn Sina"
                    pad={padFromApi({
                        contact_lines: [
                            { id: "line-1", kind: "address", value: "Road 4, Dhanmondi" },
                            { id: "line-2", kind: "phone",   value: "01700000000" },
                            { id: "line-3", kind: "custom",  label: "Serial", value: "10am-1pm" },
                        ],
                        paper: { mode: "preprinted" },
                    })}
                    onChange={() => {}}
                />,
            ),
        );
        const inputs = inputClassLists(markup).filter((classes) => classes.length > 0);

        check("every kind of field is covered, contact lines included",
            inputs.length >= 8, `found ${inputs.length}`);
        check("no field is under 16px, which would zoom an iPhone in and never out",
            inputs.every((classes) => unprefixed(classes).includes("text-base")));
        check("no field is under a 44px tap target",
            inputs.every((classes) => unprefixed(classes).includes("h-11")));
        check("a contact line's value gets its own full-width line, and only on a phone",
            markup.includes('class="order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1"'));
        check("each contact line names its kind, since a tooltip never opens on a touch screen",
            markup.includes("sm:hidden\">Address</span>"));
        // A one-row textarea with only a min-height floor clipped a wrapped address.
        check("a wrapped address grows instead of hiding its second line",
            markup.includes("[field-sizing:content]") && markup.includes('rows="2"'));
    }

    console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
    process.exitCode = failures === 0 ? 0 : 1;
}
