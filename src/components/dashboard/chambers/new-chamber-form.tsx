import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createChamber } from "@/lib/attendant-queue";
import { handleError } from "@/lib/utils";
import type { Chamber, Hospital } from "@/types/attendant-queue";
import HospitalSelect from "./hospital-select";

// Creates a chamber and invalidates the shared ["chambers"] query, so every surface
// that lists chambers (the chambers page, the pad editor, the queue panel) picks the new
// one up. Used by the chambers page, the pad editor's list and its first-run setup.

interface NewChamberFormProps {
    clinicianId:   string;
    onCreated?:    (chamber: Chamber) => void;
    onDone?:       () => void;
    onCancel?:     () => void;
    /** Omitted inside a flow that already asks the question in its own heading. */
    title?:        string;
    submitLabel?:  string;
}

export default function NewChamberForm({
    clinicianId,
    onCreated,
    onDone,
    onCancel,
    title = "New chamber",
    submitLabel = "Create chamber",
}: NewChamberFormProps) {
    const queryClient = useQueryClient();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [room, setRoom] = useState("");
    const [duplicateName, setDuplicateName] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: () =>
            createChamber({ clinician_id: clinicianId, hospital_id: hospital!.hospital_id, room_no: room.trim() }),
        onSuccess: (chamber) => {
            queryClient.invalidateQueries({ queryKey: ["chambers"] });
            toast.success("Chamber created");
            onCreated?.(chamber);
            onDone?.();
        },
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setDuplicateName(hospital?.name_en ?? "this hospital");
                return;
            }
            handleError(error, "Could not create chamber");
        },
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (hospital && room.trim() && !createMutation.isPending) createMutation.mutate();
    }

    return (
        <form onSubmit={onSubmit} className="border rounded-xl p-4 space-y-3">
            {title && <p className="font-medium">{title}</p>}
            <div>
                <label className="text-sm text-muted-foreground">Hospital / chamber</label>
                <HospitalSelect selected={hospital} onSelect={setHospital} />
            </div>
            <Input
                placeholder="Room / chamber no."
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="h-11 sm:h-9"
            />
            <p className="text-xs text-muted-foreground -mt-1">
                The room number is how your attendant tells your chambers apart when you share a hospital.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    isLoading={createMutation.isPending}
                    disabled={!hospital || !room.trim()}
                >
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>

            <Dialog open={!!duplicateName} onOpenChange={(next) => !next && setDuplicateName(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>You already have a chamber here</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        You already have a chamber at {duplicateName}. A doctor keeps one chamber per hospital, so
                        there's nothing more to add — you can manage it in the list.
                    </p>
                    <Button type="button" onClick={() => setDuplicateName(null)}>Got it</Button>
                </DialogContent>
            </Dialog>
        </form>
    );
}
