import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { visualViewportBox } from "@/hooks/use-visual-viewport";
import { availableHeightBelow } from "@/hooks/use-available-height";
import EditSurface from "@/components/prescription/editor/edit-surface";
import DebouncedSearchSelect from "@/components/prescription/debounced-search-select";
import DoctorInfo from "@/components/prescription/doctor-info";
import ListInfo from "@/components/prescription/list-info";
import MedicineView from "@/components/prescription/medicine-view";
import RxChip from "@/components/prescription/rx/rx-chip";
import { viewport } from "./dom-setup";
import { editorMarkup, listItemRowMarkup } from "./markup";

let failures = 0;
const check = (label: string, passed: boolean, detail = "") => {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : `   -> ${detail}`}`);
};
const section = (title: string) => console.log(`\n${title}`);

// ---------------------------------------------------------------------------
// Class-list helpers. Tailwind variants are prefixed (`sm:h-9`); an unprefixed
// class is what a phone actually gets, since every variant here widens upwards.
// ---------------------------------------------------------------------------
const classesOf = (markup: string, tag: string): string[][] => {
    const matches = markup.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "g"));
    return [...matches].map((match) => {
        const className = /class="([^"]*)"/.exec(match[0]);
        return className ? className[1].split(/\s+/).filter(Boolean) : [];
    });
};

const unprefixed = (classes: string[]) => classes.filter((name) => !name.includes(":"));

const TEXT_SIZE = /^text-(xs|sm|base|lg|xl|\[.*\])$/;
const AT_LEAST_16PX = new Set(["text-base", "text-lg", "text-xl"]);

function mountEditSurface(onCommit: () => void): { root: Root; host: HTMLElement } {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    act(() => {
        root.render(
            <EditSurface
                title="Medicine"
                onCommit={onCommit}
                className="inline-edit-card"
                footer={<button data-testid="done">Done</button>}
            >
                <input data-testid="field" />
            </EditSurface>,
        );
    });

    return { root, host };
}

// A search field inside the phone edit sheet — the arrangement that was clipping the results
// to a few rows.
function mountSearchInSheet(): { root: Root; host: HTMLElement } {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    act(() => {
        root.render(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <EditSurface title="Medicine" onCommit={() => {}} footer={<button>Done</button>}>
                    <DebouncedSearchSelect
                        value={null}
                        onChange={() => {}}
                        fetchOptions={async () => []}
                        queryKeyBase="sheet-search"
                    />
                </EditSurface>
            </QueryClientProvider>,
        );
    });

    return { root, host };
}

function mountListInfo(): { root: Root; host: HTMLElement } {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const noop = () => {};

    act(() => {
        root.render(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ListInfo
                    title="Chief Complaints"
                    info={[{ name: "Fever", duration: "3 days" }]}
                    fieldName="chief-complaint"
                    addEmptyItem={noop}
                    updateItem={noop}
                    removeItem={noop}
                />
            </QueryClientProvider>,
        );
    });

    return { root, host };
}

const unmount = (root: Root, host: HTMLElement) => {
    act(() => root.unmount());
    host.remove();
};

export async function runTest() {
    section("1. The keyboard inset is measured from what the clinician can actually see");
    {
        const noKeyboard = visualViewportBox({ height: 844, offsetTop: 0 }, 844);
        check("no keyboard leaves the panel on the screen edge", noKeyboard.bottomInset === 0, `${noKeyboard.bottomInset}`);
        check("the whole screen is visible", noKeyboard.visibleHeight === 844);

        const keyboard = visualViewportBox({ height: 508, offsetTop: 0 }, 844);
        check("an open keyboard lifts the panel by its height", keyboard.bottomInset === 336, `${keyboard.bottomInset}`);
        check("the panel is sized to the visible strip", keyboard.visibleHeight === 508);

        // iOS scrolls the visual viewport down to follow a focused field; the hidden band
        // below is smaller by exactly that scroll, and must never come out negative.
        const scrolled = visualViewportBox({ height: 508, offsetTop: 120 }, 844);
        check("a scrolled visual viewport shrinks the inset", scrolled.bottomInset === 216, `${scrolled.bottomInset}`);

        const overscrolled = visualViewportBox({ height: 844, offsetTop: 60 }, 844);
        check("rubber-banding never yields a negative inset", overscrolled.bottomInset === 0, `${overscrolled.bottomInset}`);
    }

    section("2. Quick-pick chips are finger-sized on a phone and unchanged on a desktop");
    {
        const markup = renderToStaticMarkup(
            <>
                <RxChip label="BD" onClick={() => {}} />
                <RxChip label="1" tone="soft" active onClick={() => {}} />
                <RxChip label="Not diluted" tone="muted" active onClick={() => {}} />
            </>,
        );
        const chips = classesOf(markup, "button");
        check("every tone renders", chips.length === 3, `${chips.length}`);
        check(
            "each chip reserves a 44px minimum on a phone",
            chips.every((chip) => chip.includes("min-h-11")),
        );
        check(
            "each chip drops back to the compact desktop chip from `sm` up",
            chips.every((chip) => chip.includes("sm:min-h-0") && chip.includes("sm:text-xs")),
        );
        check(
            "rapid tapping cannot start a text selection",
            chips.every((chip) => chip.includes("select-none")),
        );
    }

    section("3. Nothing a clinician types into is under 16px on a phone");
    {
        const markup = editorMarkup();
        const fields = [...classesOf(markup, "input"), ...classesOf(markup, "textarea")];
        check("the editor rendered its fields", fields.length >= 12, `${fields.length}`);

        const tooSmall = fields.filter((field) => {
            const sizes = unprefixed(field).filter((name) => TEXT_SIZE.test(name));
            return sizes.length !== 1 || !AT_LEAST_16PX.has(sizes[0]);
        });
        // iOS Safari zooms the page in on any focused input under 16px and never zooms out
        // again, which is what made the whole editor unusable on an iPhone.
        check("no field renders below 16px", tooSmall.length === 0, tooSmall.map((f) => f.join(" ")).join(" | "));
    }

    section("4. A list row can be removed without a hover");
    {
        const markup = listItemRowMarkup();
        const removeButton = classesOf(markup, "button").find((classes) => classes.includes("size-11"));
        check("the row carries a finger-sized remove control", !!removeButton, "no size-11 button rendered");
        check(
            "it is visible on a touch screen and hover-revealed only from `sm` up",
            !!removeButton && !removeButton.includes("opacity-0") && removeButton.includes("sm:opacity-0"),
            removeButton?.join(" "),
        );
    }

    section("5. A desktop opens the editor in place");
    {
        viewport.isPhone = false;
        let commits = 0;
        const { root, host } = mountEditSurface(() => { commits += 1; });

        const card = host.querySelector(".inline-edit-card");
        check("the editor is a card in the document", !!card);
        check("it is not portalled out of the page", host.contains(card));
        check("its actions sit inside the card", !!card?.querySelector("[data-testid=done]"));

        act(() => {
            document.body.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true }));
        });
        check("a tap outside commits rather than discards", commits === 1, `${commits}`);

        unmount(root, host);
    }

    section("6. A phone opens the editor as a sheet with its actions pinned");
    {
        viewport.isPhone = true;
        let commits = 0;
        const { root, host } = mountEditSurface(() => { commits += 1; });

        check("nothing is left behind in the document flow", host.querySelector(".inline-edit-card") === null);

        const sheet = document.querySelector("[data-slot=sheet-content]");
        check("the editor is a sheet", !!sheet);
        check("it names what is being edited", sheet?.textContent?.includes("Medicine") === true);

        const scrollArea = sheet?.querySelector(".overflow-y-auto");
        check("the fields scroll inside the sheet", !!scrollArea?.querySelector("[data-testid=field]"));
        check(
            "the actions sit outside that scroll area, so the keyboard cannot bury them",
            !!sheet?.querySelector("[data-testid=done]") && !scrollArea?.querySelector("[data-testid=done]"),
        );

        act(() => {
            document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        });
        check("dismissing the sheet commits, matching a click outside on desktop", commits === 1, `${commits}`);

        unmount(root, host);
    }

    section("7. Turning the phone mid-edit does not restart the edit");
    {
        viewport.isPhone = true;
        const { root, host } = mountEditSurface(() => {});
        const field = document.querySelector("[data-testid=field]") as HTMLInputElement | null;
        check("the sheet is open", !!field);

        // A phone turned sideways stops matching the phone query; the presentation is frozen
        // at open precisely so a half-filled editor is not torn down and rebuilt.
        viewport.isPhone = false;
        act(() => {
            window.dispatchEvent(new window.Event("resize"));
        });

        const stillTheSameField = document.querySelector("[data-testid=field]");
        check("the sheet stays open", !!document.querySelector("[data-slot=sheet-content]"));
        check("the same field element survives", stillTheSameField === field);

        unmount(root, host);
    }

    section("8. Tapping a complaint on a phone opens the real editor as a sheet");
    {
        viewport.isPhone = true;
        const { root, host } = mountListInfo();

        const row = host.querySelector(".group") as HTMLElement | null;
        check("the section lists the complaint", row?.textContent?.includes("Fever") === true);

        act(() => {
            row?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
        });

        const sheet = document.querySelector("[data-slot=sheet-content]");
        check("the editor opens as a sheet", !!sheet);
        check("the sheet is headed with the section it belongs to", sheet?.textContent?.includes("Chief Complaints") === true);
        check("the complaint is loaded into it", !!sheet?.querySelector("input"));
        check("no empty card is left in the list behind it", host.querySelector(".shadow-lg") === null);

        unmount(root, host);
    }

    section("9. The editor's letterhead does not put the doctor and the chamber side by side on a phone");
    {
        const markup = renderToStaticMarkup(<DoctorInfo sessionId="s1" />);

        // The full letterhead lays them out in one row; on a phone that row is what collided.
        const desktopOnly = markup.indexOf('class="hidden sm:block print:block"');
        const sideBySide  = markup.indexOf('class="flex items-stretch gap-4"');
        check("the side-by-side letterhead is rendered", sideBySide > -1);
        check("it is shown only from `sm` up, and in print", desktopOnly > -1 && desktopOnly < sideBySide, `${desktopOnly} / ${sideBySide}`);

        check("a phone gets its own header instead", markup.includes('class="sm:hidden print:hidden"'));

        const disclosure = /aria-expanded="false" aria-controls="rx-header-details"/.test(markup);
        check("the chamber sits behind a disclosure, under the doctor", disclosure);
        check("the disclosure is labelled with the chamber", markup.includes("Popular Diagnostic Centre"));
        check("the doctor's identity is not hidden behind it", markup.includes("Dr. Rafiqul Islam"));
    }

    section("10. Search results get every row the sheet can give them");
    {
        // The field is lifted to the top of the sheet's scroll area, so the room below it is
        // the whole area — bounded by the area's own bottom, or the keyboard, whichever is nearer.
        check("the sheet's scroll area bounds the list", availableHeightBelow(200, 640, 900) === 428, `${availableHeightBelow(200, 640, 900)}`);
        check("an open keyboard bounds it instead when it is nearer", availableHeightBelow(200, 900, 640) === 428, `${availableHeightBelow(200, 900, 640)}`);
        check("a field with no scrolling ancestor is bounded by the viewport", availableHeightBelow(100, Infinity, 800) === 688, `${availableHeightBelow(100, Infinity, 800)}`);
        check("a field measured mid-scroll never collapses to a peephole", availableHeightBelow(600, 640, 640) === 180, `${availableHeightBelow(600, 640, 640)}`);

        viewport.isPhone = true;
        const { root, host } = mountSearchInSheet();

        const field = document.querySelector("input") as HTMLInputElement | null;
        check("the search field is in the sheet", !!field);

        // React's onFocus listens for `focusin`, which only a real focus() raises.
        act(() => field?.focus());

        const results = document.querySelector("[role=listbox]") as HTMLElement | null;
        check("the results open", !!results);
        // Nothing in CSS can name the sheet scroll area's height, so it is measured.
        check("their height is measured rather than guessed", !!results?.style.maxHeight, results?.style.maxHeight);
        check(
            "they run in flow on a phone, so the sheet is not clipping them to a few rows",
            results?.className.includes("relative") === true && results?.className.includes("sm:absolute") === true,
        );

        unmount(root, host);
    }

    section("11. A medicine reads across the full column on a phone");
    {
        const rowMarkup = renderToStaticMarkup(
            <MedicineView
                medicine={{ name: "Napa 500mg", value: "napa", trade_name: "Napa 500mg", generic_name: "Paracetamol", type: "tablet", schedule: { morning: 1, noon: 0, night: 1, timing: "after" } }}
                index={0}
                onRemove={() => {}}
                setIsEditing={() => {}}
                onMoveDown={() => {}}
            />,
        );

        const row = classesOf(rowMarkup, "div")[0];
        check("the actions drop below the card on a phone", row.includes("flex-col") && row.includes("sm:flex-row"), row.join(" "));

        const card = classesOf(rowMarkup, "div").find((classes) => classes.includes("max-w-none"));
        check("the card takes the whole column", !!card && card.includes("w-full"), card?.join(" "));

        // "1+0+1 (after meal)" beside a name in a phone column left the name a few characters wide.
        const nameRow = classesOf(rowMarkup, "div").find((classes) => classes.includes("justify-between") && classes.includes("items-start"));
        check("a long frequency wraps instead of crushing the name", !!nameRow && nameRow.includes("flex-wrap"), nameRow?.join(" "));

        const nameBlock = classesOf(rowMarkup, "div").find((classes) => classes.includes("basis-48"));
        check("the name keeps a readable minimum width", !!nameBlock, "no basis-48 name block");
    }

    console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
    process.exitCode = failures === 0 ? 0 : 1;
}
