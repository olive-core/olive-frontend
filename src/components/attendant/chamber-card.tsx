import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listQueue } from "@/lib/attendant-queue";
import { useQueueStream } from "@/hooks/use-queue-stream";
import { chamberLabel, chamberRoom, type AttendantChamber } from "@/types/attendant-queue";

interface ChamberCardProps {
    chamber: AttendantChamber;
    onOpen: () => void;
    onAdd: () => void;
}

export default function ChamberCard({ chamber, onOpen, onAdd }: ChamberCardProps) {
    const queryClient = useQueryClient();

    const { data: entries = [] } = useQuery({
        queryKey: ["queue", chamber.chamber_id],
        queryFn: () => listQueue(chamber.chamber_id),
    });
    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["queue", chamber.chamber_id] });
    }, [queryClient, chamber.chamber_id]);
    useQueueStream(chamber.chamber_id, refresh);

    const inside = entries.find((entry) => entry.status === "in_room");
    const waiting = entries.filter((entry) => entry.status === "waiting");
    const next = waiting[0];
    const afterNext = waiting[1];

    const doctorName = [chamber.clinician_first_name, chamber.clinician_last_name].filter(Boolean).join(" ");
    const room = chamberRoom(chamber);
    const initials = (doctorName || "Dr")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="border rounded-xl p-4 mb-3">
            <button className="w-full flex items-center gap-3 text-left cursor-pointer" onClick={onOpen}>
                <span className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
                    {initials}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Dr. {doctorName || chamberLabel(chamber)}</p>
                    {room && <p className="text-sm font-medium text-slate-700 truncate">{room}</p>}
                    <p className="text-xs text-muted-foreground truncate">{chamberLabel(chamber)}</p>
                </div>
                <ChevronRightIcon className="size-5 text-muted-foreground shrink-0" />
            </button>

            <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <span
                        className={`size-2.5 rounded-full shrink-0 ${
                            inside ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                    />
                    {inside ? (
                        <span className="truncate">
                            <span className="font-medium">
                                {inside.first_name} {inside.last_name}
                            </span>
                            <span className="text-muted-foreground"> · in room</span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Room empty</span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <ArrowRightIcon className={`size-4 shrink-0 ${next ? "text-primary" : "text-slate-300"}`} />
                    {next ? (
                        <span className="truncate">
                            <span className="font-medium">
                                {next.first_name} {next.last_name}
                            </span>
                            {afterNext && (
                                <span className="text-muted-foreground"> • {afterNext.first_name}</span>
                            )}
                            {waiting.length > 2 && (
                                <span className="text-muted-foreground"> +{waiting.length - 2}</span>
                            )}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">No one waiting</span>
                    )}
                </div>
            </div>

            <Button className="w-full mt-3" onClick={onAdd}>
                <PlusIcon className="size-4" /> Add to Dr. {chamber.clinician_first_name || ""}
            </Button>
        </div>
    );
}
