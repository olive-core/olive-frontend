import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { visualViewportBox } from "@/hooks/use-visual-viewport";
import EditSurface from "@/components/prescription/editor/edit-surface";
import ListInfo from "@/components/prescription/list-info";
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
        const { renderToStaticMarkup } = await import("react-dom/server");
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

    console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
    process.exitCode = failures === 0 ? 0 : 1;
}
