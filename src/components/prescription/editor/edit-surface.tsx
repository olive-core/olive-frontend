import { useRef, useState, type ReactNode } from "react";

import { useCommitOnClickOutside } from "@/hooks/use-commit-on-click-outside";
import { matchesMediaQuery } from "@/hooks/use-media-query";
import EditSheet from "./edit-sheet";

// Narrow covers a phone held upright; short covers the same phone turned sideways, where an
// inline editor and the on-screen keyboard cannot both fit.
const PHONE_EDIT_VIEWPORT = "(max-width: 767px), (max-height: 500px)";

interface EditSurfaceProps {
    /** Names the edit in the sheet's header; unused inline, where the card sits in context. */
    title:      string;
    /** Committing the edit: a click outside on desktop, a dismissed sheet on a phone. */
    onCommit:   () => void;
    footer:     ReactNode;
    /** Card styling for the inline presentation. */
    className?: string;
    children:   ReactNode;
}

// One editor, two presentations: a card in the document on a desktop, a bottom sheet on a
// phone. The choice is made when the edit opens and never changes underneath the clinician,
// so turning the phone mid-edit cannot restart what they were filling in.
export default function EditSurface({ title, onCommit, footer, className, children }: EditSurfaceProps) {
    const [isPhone] = useState(() => matchesMediaQuery(PHONE_EDIT_VIEWPORT));

    if (isPhone) {
        return <EditSheet title={title} onDismiss={onCommit} footer={footer}>{children}</EditSheet>;
    }

    return <InlineEditCard onCommit={onCommit} footer={footer} className={className}>{children}</InlineEditCard>;
}

function InlineEditCard({ onCommit, footer, className, children }: Omit<EditSurfaceProps, "title">) {
    const cardRef = useRef<HTMLDivElement>(null);
    useCommitOnClickOutside(cardRef, onCommit);

    return (
        <div ref={cardRef} className={className}>
            {children}
            {footer}
        </div>
    );
}
