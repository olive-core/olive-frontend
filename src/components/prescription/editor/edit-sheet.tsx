import type { ReactNode } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useVisualViewport } from "@/hooks/use-visual-viewport";

// The type / route / unit / site pickers are Radix popovers, which render in their own
// portal. Without this, choosing one of their options reads as a tap outside the sheet and
// closes the editor mid-selection.
const POPPER_SELECTOR = "[data-radix-popper-content-wrapper]";

// Leaves a strip of the prescription visible above the sheet, so it never reads as a
// separate screen the clinician has been taken to.
const VISIBLE_HEIGHT_RATIO = 0.92;

interface EditSheetProps {
    title: string;
    /** Backdrop tap, Esc and the Android back button all land here, like a click outside on desktop. */
    onDismiss: () => void;
    /** Actions bar, pinned so the keyboard can never bury it. */
    footer:    ReactNode;
    children:  ReactNode;
}

// The phone presentation of an inline editor: a bottom sheet with its own scroll and its
// actions always in reach. Sized against the visual viewport rather than the page, because
// the on-screen keyboard shrinks what the clinician can see without moving the page at all.
export default function EditSheet({ title, onDismiss, footer, children }: EditSheetProps) {
    const viewport = useVisualViewport();

    return (
        <Sheet open onOpenChange={(open) => !open && onDismiss()}>
            <SheetContent
                side="bottom"
                showCloseButton={false}
                aria-describedby={undefined}
                className="max-h-[92dvh] gap-0 rounded-t-2xl p-0"
                style={viewport ? {
                    bottom:    viewport.bottomInset,
                    maxHeight: Math.round(viewport.visibleHeight * VISIBLE_HEIGHT_RATIO),
                } : undefined}
                onInteractOutside={(event) => {
                    if ((event.target as HTMLElement | null)?.closest(POPPER_SELECTOR)) event.preventDefault();
                }}
                // Without this the first field takes focus, and on an edit that means the
                // keyboard covering the sheet and a search dropdown over the fields before
                // the clinician has asked for either.
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <div className="shrink-0 border-b border-slate-100 px-4 pb-2.5 pt-2">
                    <div aria-hidden className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300" />
                    <SheetTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {title}
                    </SheetTitle>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

                <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">{footer}</div>
            </SheetContent>
        </Sheet>
    );
}
