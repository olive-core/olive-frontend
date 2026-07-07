// Bridges the live preview and the control panel: every editable region in the preview
// carries a `data-focus="<key>"` attribute, and its matching control input carries the id
// `hf-<key>`. Clicking the region scrolls that exact field into the space below the sticky
// preview, focuses it, and flashes a ring around it.

export function controlId(focusKey: string): string {
    return `hf-${focusKey}`;
}

// The field's visual unit: its label wrapper for labelled inputs, or the whole draggable
// row for contact lines — so the flash ring wraps something that reads as "this field".
function fieldAnchor(input: HTMLElement): HTMLElement {
    return (input.closest("label") ?? input.closest("[data-contact-row]") ?? input) as HTMLElement;
}

// The preview is sticky, so scrollIntoView alone can land the field underneath it —
// scroll manually so the field settles just below the preview's bottom edge.
function scrollFieldBelowStickyPreview(anchor: HTMLElement): void {
    const stickyBottom = document.querySelector("[data-sticky-preview]")?.getBoundingClientRect().bottom ?? 0;
    const targetTop = window.scrollY + anchor.getBoundingClientRect().top - stickyBottom - 16;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
}

export function focusControl(focusKey: string): void {
    const input = document.getElementById(controlId(focusKey));
    if (!input) return;

    const anchor = fieldAnchor(input);
    scrollFieldBelowStickyPreview(anchor);
    window.setTimeout(() => input.focus({ preventScroll: true }), 250);

    const ringTarget = input.closest("[data-contact-row]") ?? input;
    ringTarget.classList.add("ring-2", "ring-emerald-400");
    window.setTimeout(() => ringTarget.classList.remove("ring-2", "ring-emerald-400"), 1200);
}

export function focusKeyFromEvent(target: EventTarget | null): string | null {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest("[data-focus]")?.getAttribute("data-focus") ?? null;
}
