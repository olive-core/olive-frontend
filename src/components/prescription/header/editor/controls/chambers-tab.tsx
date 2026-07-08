import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { Building2, PlusIcon, Trash2Icon } from "lucide-react";

import { chamberLabel, chamberRoom, type Chamber } from "@/types/attendant-queue";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { useAuthStore } from "@/stores/auth-store";
import { deleteChamber } from "@/lib/attendant-queue";
import { handleError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewChamberForm from "@/components/dashboard/chambers/new-chamber-form";
import { controlId } from "../focus-field";
import ChamberPadFields from "../../../chamber-pad-fields";

function ChamberPadEditor({ chamber }: { chamber: Chamber }) {
    const pad = useHeaderConfigStore((state) => state.pads[chamber.chamber_id]);
    const patchPad = useHeaderConfigStore((state) => state.patchPad);

    if (!pad) return null;
    const id = chamber.chamber_id;

    return (
        <ChamberPadFields
            chamberId={id}
            chamberLabel={chamberLabel(chamber)}
            pad={pad}
            onChange={(patch) => patchPad(id, patch)}
            nameFieldId={controlId(`pad-${id}-name`)}
        />
    );
}

// Deleting here mirrors the Chambers page: same endpoint, same shared ["chambers"]
// invalidation; the store's pad hydration drops the removed chamber on refetch.
function DeleteChamberControl({ chamber }: { chamber: Chamber }) {
    const queryClient = useQueryClient();
    const previewChamberId = useHeaderConfigStore((state) => state.previewChamberId);
    const setPreviewChamber = useHeaderConfigStore((state) => state.setPreviewChamber);
    const setOpenPadId = useHeaderConfigStore((state) => state.setOpenPadId);
    const [confirming, setConfirming] = useState(false);
    const room = chamberRoom(chamber);

    const deleteMutation = useMutation({
        mutationFn: () => deleteChamber(chamber.chamber_id),
        onSuccess: () => {
            if (previewChamberId === chamber.chamber_id) setPreviewChamber(null);
            setOpenPadId(null);
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
                Delete chamber
            </Button>

            <Dialog open={confirming} onOpenChange={(next) => !next && setConfirming(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this chamber?</DialogTitle>
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
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Creating a chamber here goes through the same form as the Chambers page; the shared
// ["chambers"] query invalidation brings the new chamber into this tab, where its pad
// opens ready for logo/address/serial details.
function AddChamberControl() {
    const clinicianId = useAuthStore((state) => state.userId);
    const setOpenPadId = useHeaderConfigStore((state) => state.setOpenPadId);
    const [isAdding, setIsAdding] = useState(false);

    if (!clinicianId) return null;

    if (!isAdding) {
        return (
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setIsAdding(true)}>
                <PlusIcon className="size-4" />
                Add chamber
            </Button>
        );
    }

    return (
        <NewChamberForm
            clinicianId={clinicianId}
            onDone={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
            onCreated={(chamber) => setOpenPadId(chamber.chamber_id)}
        />
    );
}

// One accordion card per chamber. Editing a pad here is what the header shows when a
// prescription is written at that chamber; the pad also feeds the footer of the
// doctor's other pads.
export default function ChambersTab() {
    const chambers = useHeaderConfigStore((state) => state.chambers);
    const openPadId = useHeaderConfigStore((state) => state.openPadId);
    const setOpenPadId = useHeaderConfigStore((state) => state.setOpenPadId);
    const dirtyPadIds = useHeaderConfigStore((state) => state.dirtyPadIds);

    if (chambers.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
                <Building2 className="size-6 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No chambers yet</p>
                <p className="max-w-[36ch] text-xs text-slate-400">
                    Add your chambers to give each one its own pad — the prescription header
                    switches automatically to wherever you're sitting.
                </p>
                <div className="w-full text-left">
                    <AddChamberControl />
                </div>
                <Link to="/doctor/chambers" className="text-xs text-slate-400 underline-offset-2 hover:underline">
                    Attendants and more on the Chambers page
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="px-1 text-xs text-slate-400">
                Each chamber gets its own pad: name, logo and contact lines. The header uses the
                pad of the chamber a prescription is written at.
            </p>
            <Accordion
                type="single"
                collapsible
                value={openPadId ?? ""}
                onValueChange={(value) => setOpenPadId(value || null)}
                className="flex flex-col gap-2"
            >
                {chambers.map((chamber) => {
                    const room = chamberRoom(chamber);
                    return (
                        <AccordionItem
                            key={chamber.chamber_id}
                            value={chamber.chamber_id}
                            className="rounded-xl border bg-white px-4 shadow-xs last:border-b"
                        >
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <Building2 className="size-4 text-emerald-600" />
                                    {chamberLabel(chamber)}
                                    {room && <span className="text-xs font-normal text-slate-400">{room}</span>}
                                    {dirtyPadIds.includes(chamber.chamber_id) && (
                                        <span className="size-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
                                    )}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-3 pb-4">
                                <ChamberPadEditor chamber={chamber} />
                                <div className="border-t pt-2">
                                    <DeleteChamberControl chamber={chamber} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
            <AddChamberControl />
        </div>
    );
}
