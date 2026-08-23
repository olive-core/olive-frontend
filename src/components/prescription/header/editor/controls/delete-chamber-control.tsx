import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2Icon } from "lucide-react";

import { chamberLabel, chamberRoom, type Chamber } from "@/types/attendant-queue";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { deleteChamber } from "@/lib/attendant-queue";
import { handleError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Deleting here mirrors the Chambers page: same endpoint, same shared ["chambers"]
// invalidation; the store's pad hydration drops the removed chamber on refetch.
export default function DeleteChamberControl({ chamber }: { chamber: Chamber }) {
    const queryClient = useQueryClient();
    const previewChamberId = useHeaderConfigStore((state) => state.previewChamberId);
    const setPreviewChamber = useHeaderConfigStore((state) => state.setPreviewChamber);
    const setOpenSection = useHeaderConfigStore((state) => state.setOpenSection);
    const [confirming, setConfirming] = useState(false);
    const room = chamberRoom(chamber);

    const deleteMutation = useMutation({
        mutationFn: () => deleteChamber(chamber.chamber_id),
        onSuccess: () => {
            if (previewChamberId === chamber.chamber_id) setPreviewChamber(null);
            setOpenSection(null);
            setConfirming(false);
            queryClient.invalidateQueries({ queryKey: ["chambers"] });
            toast.success("Chamber deleted");
        },
        onError: (error) => handleError(error, "Could not delete chamber"),
    });

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-rose-500 hover:text-rose-600"
                onClick={() => setConfirming(true)}
            >
                <Trash2Icon className="size-4" />
                Remove this chamber
            </Button>

            <Dialog open={confirming} onOpenChange={(next) => !next && setConfirming(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove this chamber?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {chamberLabel(chamber)}
                        {room ? ` · ${room}` : ""} will be removed along with its pad, and its attendants
                        detached. Past prescriptions stay intact.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirming(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            isLoading={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                        >
                            Remove
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
