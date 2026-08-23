import { useState } from "react";
import { EyeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import HeaderLivePreview from "./header-live-preview";

// A phone cannot hold the paper and the form side by side, so the preview becomes
// something the doctor asks for by name. The form then gets the whole screen, and the
// preview gets the whole screen when it is wanted — better than both being cramped.
export default function PadPreviewSheet() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(true)}>
                <EyeIcon className="size-4" />
                Preview
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="bottom" className="max-h-[92svh] gap-0 rounded-t-2xl">
                    <SheetHeader className="pb-2">
                        <SheetTitle>Your prescription pad</SheetTitle>
                        <SheetDescription>How the top of the paper will print.</SheetDescription>
                    </SheetHeader>
                    {/* A flex child will not shrink below its content without min-h-0, and
                        then the sheet overflows instead of scrolling. */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                        <HeaderLivePreview onEditRequest={() => setIsOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
