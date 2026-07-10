import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "@tanstack/react-router";
import { Building2Icon, ChevronRightIcon, PenIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NumberGroupInputMemo from "@/components/dashboard/number-group-input";
import { useAuthStore } from "@/stores/auth-store";
import {
    addChamberAttendant,
    deleteChamber,
    listChamberAttendants,
    listChambers,
    revokeChamberAttendant,
    updateChamber,
} from "@/lib/attendant-queue";
import { chamberLabel, chamberRoom, type Chamber, type Hospital } from "@/types/attendant-queue";
import { handleError } from "@/lib/utils";
import { padHasContent } from "@/lib/chamber-pad";
import HospitalSelect from "./hospital-select";
import NewChamberForm from "./new-chamber-form";

const emptyPhone = () => ["0", "1"].concat(Array(9).fill(""));
const isPhoneComplete = (phone: string[]) =>
    phone.length === 11 && phone.every((c) => c >= "0" && c <= "9");

export default function ChambersManager() {
    const clinicianId = useAuthStore((s) => s.userId);
    const { data: chambers = [] } = useQuery({ queryKey: ["chambers"], queryFn: listChambers });
    const [showCreate, setShowCreate] = useState(false);

    // A doctor with no chambers gets the form straight away; once they have one it
    // collapses behind a button so the list stays the focus.
    const creating = showCreate || chambers.length === 0;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            <div>
                <h1 className="text-xl font-medium mb-1">Chambers &amp; Attendants</h1>
                <p className="text-sm text-muted-foreground">
                    Each chamber carries its own prescription pad (logo, address, serial, phone) and its
                    attendants, added by phone so they can register your queue.
                </p>
            </div>

            {chambers.map((chamber) => (
                <ChamberRow key={chamber.chamber_id} chamber={chamber} />
            ))}

            {creating ? (
                <NewChamberForm
                    clinicianId={clinicianId!}
                    onDone={() => setShowCreate(false)}
                    onCancel={chambers.length > 0 ? () => setShowCreate(false) : undefined}
                />
            ) : (
                <Button variant="outline" className="w-full" onClick={() => setShowCreate(true)}>
                    <PlusIcon className="size-4" /> Add another chamber
                </Button>
            )}
        </div>
    );
}

// The chamber's printed identity is edited on the pad editor; this row deep-links
// straight to that chamber's pad section there.
function ChamberPadLink({ chamber }: { chamber: Chamber }) {
    return (
        <Link
            to="/doctor/prescription-header"
            search={{ tab: "chambers", chamber: chamber.chamber_id }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:bg-slate-50"
        >
            <Building2Icon className="size-4 shrink-0 text-emerald-600" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                    Prescription pad
                    {padHasContent(chamber.pad_config) && (
                        <span className="size-1.5 rounded-full bg-emerald-500" title="Configured" />
                    )}
                </span>
                <span className="text-xs text-muted-foreground">
                    Name, logo, address, phone &amp; hours printed at this chamber
                </span>
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-slate-400" />
        </Link>
    );
}

function ChamberRow({ chamber }: { chamber: Chamber }) {
    const queryClient = useQueryClient();
    const [phone, setPhone] = useState<string[]>(emptyPhone);
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const room = chamberRoom(chamber);

    const { data: attendants = [] } = useQuery({
        queryKey: ["chamber-attendants", chamber.chamber_id],
        queryFn: () => listChamberAttendants(chamber.chamber_id),
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["chamber-attendants", chamber.chamber_id] });

    const addMutation = useMutation({
        mutationFn: () => addChamberAttendant(chamber.chamber_id, "+88" + phone.join("")),
        onSuccess: () => {
            invalidate();
            setPhone(emptyPhone());
            toast.success("Attendant added");
        },
        onError: (error) => handleError(error, "Could not add attendant"),
    });

    const revokeMutation = useMutation({
        mutationFn: (attendantUserId: string) => revokeChamberAttendant(chamber.chamber_id, attendantUserId),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteChamber(chamber.chamber_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chambers"] });
            setConfirmDelete(false);
            toast.success("Chamber deleted");
        },
        onError: (error) => handleError(error, "Could not delete chamber"),
    });

    return (
        <div className="border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                    {chamberLabel(chamber)}
                    {room ? ` · ${room}` : ""}
                </p>
                <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                        <PenIcon className="size-3" /> Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete chamber"
                        onClick={() => setConfirmDelete(true)}
                    >
                        <Trash2Icon className="size-4 text-rose-500" />
                    </Button>
                </div>
            </div>

            <ChamberPadLink chamber={chamber} />

            <div>
                <p className="text-sm text-muted-foreground mb-1">Attendants</p>
                {attendants.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
                {attendants.map((attendant) => (
                    <div key={attendant.id} className="flex items-center justify-between py-1">
                        <span className="text-sm">
                            {attendant.first_name} {attendant.last_name} · {attendant.phone}
                            {attendant.status === "pending" && (
                                <span className="ml-2 text-xs text-amber-600">Pending</span>
                            )}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeMutation.mutate(attendant.attendant_user_id)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Add an attendant by phone</p>
                <NumberGroupInputMemo numberInput={phone} setNumberInput={setPhone} />
                <Button
                    className="w-full"
                    onClick={() => addMutation.mutate()}
                    isLoading={addMutation.isPending}
                    disabled={!isPhoneComplete(phone)}
                >
                    Add attendant
                </Button>
            </div>

            {editing && (
                <EditChamberDialog chamber={chamber} onClose={() => setEditing(false)} />
            )}

            <Dialog open={confirmDelete} onOpenChange={(next) => !next && setConfirmDelete(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this chamber?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {chamberLabel(chamber)}
                        {room ? ` · ${room}` : ""} will be removed and its attendants detached. Past prescriptions
                        stay intact.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>
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
        </div>
    );
}

function EditChamberDialog({ chamber, onClose }: { chamber: Chamber; onClose: () => void }) {
    const queryClient = useQueryClient();
    const [hospital, setHospital] = useState<Hospital | null>(
        chamber.hospital_id ? { hospital_id: chamber.hospital_id, name_en: chamber.hospital_name } : null,
    );
    const [room, setRoom] = useState(chamber.room_no ?? "");

    const updateMutation = useMutation({
        mutationFn: () =>
            updateChamber(chamber.chamber_id, { hospital_id: hospital?.hospital_id, room_no: room.trim() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chambers"] });
            toast.success("Chamber updated");
            onClose();
        },
        onError: (error) => handleError(error, "Could not update chamber"),
    });

    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit chamber</DialogTitle>
                </DialogHeader>
                <div>
                    <label className="text-sm text-muted-foreground">Hospital / chamber</label>
                    <HospitalSelect selected={hospital} onSelect={setHospital} />
                </div>
                <Input placeholder="Room / chamber no." value={room} onChange={(e) => setRoom(e.target.value)} />
                <Button
                    onClick={() => updateMutation.mutate()}
                    isLoading={updateMutation.isPending}
                    disabled={!hospital || !room.trim()}
                >
                    Save changes
                </Button>
            </DialogContent>
        </Dialog>
    );
}
