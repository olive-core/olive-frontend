import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "@tanstack/react-router";
import { Building2Icon, ChevronDownIcon, ChevronRightIcon, EllipsisIcon, PenIcon, PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
import { padIsConfigured } from "@/lib/chamber-pad";
import { chamberSectionId } from "@/stores/header-config-store";
import HospitalSelect from "./hospital-select";
import NewChamberForm from "./new-chamber-form";

const emptyPhone = () => ["0", "1"].concat(Array(9).fill(""));
const isPhoneComplete = (phone: string[]) =>
    phone.length === 11 && phone.every((c) => c >= "0" && c <= "9");

export default function ChambersManager({ embedded = false }: { embedded?: boolean }) {
    const clinicianId = useAuthStore((s) => s.userId);
    const { data: chambers = [], isPending, isError, refetch } = useQuery({ queryKey: ["chambers"], queryFn: listChambers });
    const [showCreate, setShowCreate] = useState(false);

    // A doctor with no chambers gets the form straight away; once they have one it
    // collapses behind a button so the list stays the focus.
    const creating = showCreate || chambers.length === 0;

    return (
        <div className={embedded ? "space-y-4" : "w-full max-w-2xl mx-auto px-4 py-6 space-y-4"}>
            {!embedded && <div>
                <h1 className="text-xl font-medium mb-1">Chambers &amp; Attendants</h1>
                <p className="text-sm text-muted-foreground">
                    The places you sit, and the attendants who register your queue at each — added by
                    phone. Each chamber's prescription pad is set up from the row below it.
                </p>
            </div>}

            {isPending ? <Skeleton className="h-48 rounded-2xl" /> : isError ? (
                <div role="alert" className="rounded-xl border p-5 text-sm text-slate-600">
                    Your chambers couldn’t load.
                    <Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>Try again</Button>
                </div>
            ) : <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">{chambers.length} {chambers.length === 1 ? 'chamber' : 'chambers'}</p>
                    {!creating && <Button variant="outline" className="min-h-11" onClick={() => setShowCreate(true)}><PlusIcon className="size-4" />Add chamber</Button>}
                </div>
                {creating && <NewChamberForm clinicianId={clinicianId!} onDone={() => setShowCreate(false)} onCancel={chambers.length > 0 ? () => setShowCreate(false) : undefined} />}
                {chambers.map((chamber) => <ChamberRow key={chamber.chamber_id} chamber={chamber} />)}
            </>}

        </div>
    );
}

// The chamber's printed identity is edited on the pad editor; this row deep-links
// straight to that chamber's pad section there.
function ChamberPadLink({ chamber }: { chamber: Chamber }) {
    return (
        <Link
            to="/doctor/prescription-header"
            search={{ section: chamberSectionId(chamber.chamber_id) }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:bg-slate-50"
        >
            <Building2Icon className="size-4 shrink-0 text-emerald-600" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                    Prescription pad
                    {padIsConfigured(chamber.pad_config) && (
                        <span className="size-1.5 rounded-full bg-emerald-500" title="Configured" />
                    )}
                </span>
                <span className="text-xs text-muted-foreground">
                    {padIsConfigured(chamber.pad_config) ? "Configured · view or edit this chamber’s pad" : "Set up paper and printed details"}
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
    const [attendantsOpen, setAttendantsOpen] = useState(false);
    const attendantsId = useId();
    const room = chamberRoom(chamber);

    const { data: attendants = [], isPending: attendantsLoading, isError: attendantsError, refetch: refetchAttendants } = useQuery({
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
        onError: (error) => handleError(error, "Could not remove attendant"),
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
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="break-words text-base font-semibold text-slate-900">{chamberLabel(chamber)}</h3>
                    {room && <p className="mt-1 break-words text-sm text-slate-500">Room / chamber {room}</p>}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-11 shrink-0" aria-label={`Actions for ${chamberLabel(chamber)}`}><EllipsisIcon className="size-5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl p-1.5">
                        <DropdownMenuItem className="min-h-11 rounded-lg" onSelect={() => setEditing(true)}><PenIcon />Edit chamber</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="min-h-11 rounded-lg" variant="destructive" onSelect={() => setConfirmDelete(true)}><Trash2Icon />Delete chamber</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ChamberPadLink chamber={chamber} />

            <div className="border-t border-slate-100 pt-2">
                <button type="button" aria-expanded={attendantsOpen} aria-controls={attendantsId} onClick={() => setAttendantsOpen(!attendantsOpen)} className="flex min-h-12 w-full items-center gap-3 rounded-lg text-left text-sm text-slate-600 transition-colors hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600">
                    <UsersIcon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">{attendantsLoading ? 'Loading attendants…' : attendantsError ? 'Attendants unavailable' : `${attendants.length} ${attendants.length === 1 ? 'attendant' : 'attendants'}`}</span>
                    <span className="text-xs font-medium">{attendantsOpen ? 'Close' : 'Manage'}</span>
                    <ChevronDownIcon className={`size-4 shrink-0 transition-transform motion-reduce:transition-none ${attendantsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div id={attendantsId} hidden={!attendantsOpen} className="space-y-4 pt-3">
                    {attendantsError ? <div role="alert" className="text-sm text-slate-600">Couldn’t load attendants.<Button variant="outline" className="ml-2 min-h-11" onClick={() => refetchAttendants()}>Try again</Button></div> : attendantsLoading ? <Skeleton className="h-16" /> : <>
                        {attendants.length === 0 && <p className="text-sm text-slate-500">Add an attendant to help register patients at this chamber.</p>}
                        <div className="divide-y divide-slate-100">
                            {attendants.map((attendant) => (
                                <div key={attendant.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                                    <div className="min-w-0 flex-1 basis-40">
                                        <p className="break-words text-sm font-medium text-slate-800">{attendant.name || 'Invited attendant'}</p>
                                        <p className="break-words text-xs text-slate-500">{attendant.phone}{attendant.status === 'pending' && <span className="ml-2 text-amber-700">Pending</span>}</p>
                                    </div>
                                    <Button variant="ghost" className="min-h-11 text-slate-500" disabled={revokeMutation.isPending} onClick={() => revokeMutation.mutate(attendant.attendant_user_id)}>Remove</Button>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 rounded-xl bg-slate-50 p-3 sm:p-4">
                            <p className="text-sm font-medium text-slate-700">Add an attendant by phone</p>
                            <NumberGroupInputMemo numberInput={phone} setNumberInput={setPhone} />
                            <Button className="min-h-11 w-full" onClick={() => addMutation.mutate()} isLoading={addMutation.isPending} disabled={!isPhoneComplete(phone)}>Add attendant</Button>
                        </div>
                    </>}
                </div>
            </div>

            {editing && (
                <EditChamberDialog chamber={chamber} onClose={() => setEditing(false)} />
            )}

            <Dialog open={confirmDelete} onOpenChange={(next) => !next && setConfirmDelete(false)}>
                <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
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

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (hospital && room.trim() && !updateMutation.isPending) updateMutation.mutate();
    }

    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit chamber</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Hospital / chamber</label>
                        <HospitalSelect selected={hospital} onSelect={setHospital} />
                    </div>
                    <Input placeholder="Room / chamber no." value={room} onChange={(e) => setRoom(e.target.value)} />
                    <Button
                        type="submit"
                        isLoading={updateMutation.isPending}
                        disabled={!hospital || !room.trim()}
                    >
                        Save changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
