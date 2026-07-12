import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listMyChambers } from "@/lib/attendant-queue";
import { chamberLabel, chamberRoom, type AttendantChamber } from "@/types/attendant-queue";
import QueueView from "./queue-view";
import ChamberCard from "./chamber-card";
import AddPatientDialog from "./add-patient-dialog";
import PendingInvites from "./pending-invites";

const doctorLabel = (chamber: AttendantChamber) =>
    `Dr. ${(chamber.clinician_name ?? "")}`.trim();

export default function AttendantHome() {
    const { data: chambers = [], isLoading } = useQuery({
        queryKey: ["my-chambers"],
        queryFn: listMyChambers,
    });

    const [openChamberId, setOpenChamberId] = useState<string | null>(null);
    const [addChamberId, setAddChamberId] = useState<string | null>(null);

    const single = chambers.length === 1 ? chambers[0] : null;
    const drilled = openChamberId ? chambers.find((c) => c.chamber_id === openChamberId) : null;
    const active = single ?? drilled ?? null;

    return (
        <div className="px-4 py-6">
            <PendingInvites />

            {isLoading ? (
                <p className="text-center text-muted-foreground py-10">Loading…</p>
            ) : chambers.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 max-w-sm mx-auto px-6">
                    No chambers yet. When a doctor adds you, the invitation shows up above to accept.
                </p>
            ) : active ? (
                <QueueView
                    chamberId={active.chamber_id}
                    title={doctorLabel(active)}
                    subtitle={[chamberLabel(active), chamberRoom(active)].filter(Boolean).join(" · ")}
                    onAdd={() => setAddChamberId(active.chamber_id)}
                    onBack={single ? undefined : () => setOpenChamberId(null)}
                />
            ) : (
                <div className="max-w-md mx-auto">
                    {chambers.map((chamber) => (
                        <ChamberCard
                            key={chamber.chamber_id}
                            chamber={chamber}
                            onOpen={() => setOpenChamberId(chamber.chamber_id)}
                            onAdd={() => setAddChamberId(chamber.chamber_id)}
                        />
                    ))}
                </div>
            )}

            {addChamberId && (
                <AddPatientDialog
                    chamberId={addChamberId}
                    open={!!addChamberId}
                    onClose={() => setAddChamberId(null)}
                />
            )}
        </div>
    );
}
