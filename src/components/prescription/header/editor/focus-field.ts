// Bridges the live preview and the control panel: every editable region in the preview
// carries a `data-focus="<key>"` attribute, and its matching control input carries the id
// `hf-<key>`. Clicking the region scrolls that exact field into open space, focuses it, and
// flashes a ring around it.

export function controlId(focusKey: string): string {
    return `hf-${focusKey}`;
}

// The field's visual unit: its label wrapper for labelled inputs, or the whole draggable
// row for contact lines — so the flash ring wraps something that reads as "this field".
function fieldAnchor(input: HTMLElement): HTMLElement {
    return (input.closest("label") ?? input.closest("[data-contact-row]") ?? input) as HTMLElement;
}

// Something is always pinned over the top of the page — the sticky preview pane on a wide
// screen, the dashboard navbar on a phone — so scrollIntoView alone can land the field
// underneath it. Both are measured rather than assumed: the navbar's height is set in rem
// plus a safe-area inset, so no constant here would stay true.
function coveredTopEdge(): number {
    const cover = document.querySelector("[data-sticky-preview]") ?? document.querySelector("nav");
    return cover ? cover.getBoundingClientRect().bottom : 0;
}

function scrollFieldIntoOpenSpace(anchor: HTMLElement): void {
    const targetTop = window.scrollY + anchor.getBoundingClientRect().top - coveredTopEdge() - 16;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
}

// Scrolls to, focuses and flashes the control for a focus key. Assumes the control is
// mounted — when controls live behind a collapsed section, go through `focusControl`,
// which lets the editor open that section first.
export function focusField(focusKey: string): void {
    const input = document.getElementById(controlId(focusKey));
    if (!input) return;

    const anchor = fieldAnchor(input);
    scrollFieldIntoOpenSpace(anchor);
    window.setTimeout(() => input.focus({ preventScroll: true }), 250);

    const ringTarget = input.closest("[data-contact-row]") ?? input;
    ringTarget.classList.add("ring-2", "ring-emerald-400");
    window.setTimeout(() => ringTarget.classList.remove("ring-2", "ring-emerald-400"), 1200);
}

// The editor registers a resolver that knows which section hosts each key; it opens that
// section, then calls focusField once the control is mounted. Without a resolver (or for
// keys it doesn't remap) we fall back to focusing directly.
type FocusResolver = (focusKey: string) => void;

let focusResolver: FocusResolver | null = null;

export function registerFocusResolver(resolver: FocusResolver): () => void {
    focusResolver = resolver;
    return () => {
        if (focusResolver === resolver) focusResolver = null;
    };
}

export function focusControl(focusKey: string): void {
    if (focusResolver) {
        focusResolver(focusKey);
        return;
    }
    focusField(focusKey);
}

export function focusKeyFromEvent(target: EventTarget | null): string | null {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest("[data-focus]")?.getAttribute("data-focus") ?? null;
}
