import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon, ChevronUpIcon, MicIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    listChambers,
    listQueue,
    removeQueueEntry,
    reorderQueue,
    startConsultation,
} from "@/lib/attendant-queue";
import { applyOptimisticReorder } from "@/lib/queue-reorder";
import { useQueueStream } from "@/hooks/use-queue-stream";
import { useConsultationStartGuard } from "@/hooks/use-consultation-start-guard";
import { chamberLabel, chamberRoom, type QueueEntry } from "@/types/attendant-queue";
import { useActiveChamberStore, useLastChamberId } from "@/stores/active-chamber-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn, handleError } from "@/lib/utils";
import {
    eligibleFollowUpSources,
    usePatientConsultations,
} from "@/hooks/use-patient-consultations";
import ConsultationModeActions from "@/components/consultation-start/consultation-mode-actions";
import FollowUpSourcePicker from "@/components/consultation-start/follow-up-source-picker";

interface DoctorQueuePanelProps {
    /** Reports readiness + whether a patient is waiting, so the parent can hold
     * the manual phone-entry flow until the queue is known (no flicker) and hide
     * it while someone is waiting (single action on screen). */
    onStateChange?: (state: { ready: boolean; hasWaiting: boolean }) => void;
}

/**
 * Live queue on the doctor's dashboard. Shows the next waiting patient as a hero
 * card with Start Consultation, plus who is inside and who is up next. The doctor
 * can reorder or remove entries here too (removal is confirmed, since they rarely
 * mean to). Renders nothing for doctors with no chambers, so the classic
 * phone-entry flow is untouched for them.
 */
export default function DoctorQueuePanel({ onStateChange }: DoctorQueuePanelProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userId } = useAuthStore();
    const setLastChamber = useActiveChamberStore((state) => state.setLastChamber);

    const chambersQuery = useQuery({ queryKey: ["chambers"], queryFn: listChambers });
    const chambers = chambersQuery.data ?? [];
    const storedChamberId = useLastChamberId(userId ?? undefined);
    const [chamberId, setChamberId] = useState<string | null>(null);
    const canStartConsultation = useConsultationStartGuard();
    const [starting, setStarting] = useState(false);
    const [startingSourceSessionId, setStartingSourceSessionId] = useState<string | null>(null);
    const [modeOpen, setModeOpen] = useState(false);
    const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
    const [pendingRemove, setPendingRemove] = useState<QueueEntry | null>(null);

    // The panel's selection is the doctor's "I'm sitting here now" — remember it so
    // walk-in sessions started from this page print on the same chamber's pad without
    // the doctor picking again on the prescription screen.
    const selectChamber = useCallback((nextChamberId: string) => {
        setChamberId(nextChamberId);
        if (userId) setLastChamber(userId, nextChamberId);
    }, [setLastChamber, userId]);

    // Default to the chamber that actually has patients today, then the remembered
    // one, so a doctor with several chambers lands on the right pad without a click.
    const preferredChamberId = (
        chambers.find((c) => (c.active_count ?? 0) > 0)
        ?? chambers.find((c) => c.chamber_id === storedChamberId)
        ?? chambers[0]
    )?.chamber_id;
    useEffect(() => {
        if (!chamberId && preferredChamberId) selectChamber(preferredChamberId);
    }, [preferredChamberId, chamberId, selectChamber]);

    const queueQuery = useQuery({
        queryKey: ["queue", chamberId],
        queryFn: () => listQueue(chamberId!),
        enabled: !!chamberId,
    });
    const entries = queueQuery.data ?? [];
    const refresh = useCallback(() => {
        if (chamberId) queryClient.invalidateQueries({ queryKey: ["queue", chamberId] });
    }, [queryClient, chamberId]);
    useQueueStream(chamberId ?? undefined, refresh);

    const inside = entries.find((entry) => entry.status === "in_room");
    const waiting = entries.filter((entry) => entry.status === "waiting");
    const next = waiting[0];
    const patientConsultationsQuery = usePatientConsultations(next?.patient_id);
    const followUpSources = eligibleFollowUpSources(patientConsultationsQuery.data ?? [], userId);

    const ready = !chambersQuery.isLoading && (chambers.length === 0 || queueQuery.isSuccess);
    useEffect(() => {
        onStateChange?.({ ready, hasWaiting: waiting.length > 0 });
    }, [ready, waiting.length, onStateChange]);

    const reorderMutation = useMutation({
        mutationFn: (ids: string[]) => reorderQueue(chamberId!, ids),
        onMutate: (ids) => applyOptimisticReorder(queryClient, chamberId, ids),
        onError: (error, _ids, context) => {
            context?.rollback();
            handleError(error, "Could not reorder the queue");
        },
        onSettled: refresh,
    });
    const removeMutation = useMutation({
        mutationFn: removeQueueEntry,
        onSuccess: () => {
            refresh();
            setPendingRemove(null);
        },
        onError: (error) => handleError(error, "Could not remove from the queue"),
    });

    const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= waiting.length) return;
        const ids = waiting.map((entry) => entry.queue_entry_id);
        [ids[index], ids[target]] = [ids[target], ids[index]];
        reorderMutation.mutate(ids);
    };

    const start = async (entry: QueueEntry, followUpOfSessionId?: string) => {
        if (!canStartConsultation()) return;
        setStarting(true);
        setStartingSourceSessionId(followUpOfSessionId ?? null);
        try {
            const { session_id } = await startConsultation(entry.queue_entry_id, followUpOfSessionId);
            // Remember the chamber so later walk-ins default to today's pad.
            if (userId) setLastChamber(userId, entry.chamber_id);
            navigate({
                to: "/doctor/consultation/$userId/$consultationId",
                params: { userId: entry.patient_id, consultationId: session_id },
            });
        } catch (error) {
            handleError(error, "Could not start consultation");
        } finally {
            setStarting(false);
            setStartingSourceSessionId(null);
        }
    };

    const chooseMode = (entry: QueueEntry) => {
        if (patientConsultationsQuery.isError) {
            handleError(
                patientConsultationsQuery.error,
                "Could not check previous consultations. Please try again",
            );
            patientConsultationsQuery.refetch();
            return;
        }
        if (followUpSources.length === 0) {
            start(entry);
            return;
        }
        setModeOpen(true);
    };

    if (chambers.length === 0) return null;

    return (
        <div className="w-full max-w-md mx-auto border rounded-xl p-4 mb-8">
            {chambers.length > 1 && (
                <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl">
                    {chambers.map((chamber) => {
                        const selected = chamber.chamber_id === chamberId;
                        const count = chamber.active_count ?? 0;
                        const room = chamberRoom(chamber);
                        return (
                            <button
                                key={chamber.chamber_id}
                                onClick={() => selectChamber(chamber.chamber_id)}
                                className={cn(
                                    "flex-1 min-w-0 rounded-lg px-3 py-2 cursor-pointer transition-colors",
                                    selected ? "bg-white shadow-sm" : "hover:bg-white/60",
                                )}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <span
                                        className={cn(
                                            "text-sm truncate",
                                            selected ? "font-medium text-foreground" : "text-muted-foreground",
                                        )}
                                    >
                                        {room || chamberLabel(chamber)}
                                    </span>
                                    {count > 0 && (
                                        <span
                                            className={cn(
                                                "text-[10px] leading-none px-1.5 py-0.5 rounded-full font-medium shrink-0",
                                                selected ? "bg-primary text-white" : "bg-emerald-100 text-emerald-700",
                                            )}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </div>
                                {room && (
                                    <div className="text-[10px] text-muted-foreground truncate text-center">
                                        {chamberLabel(chamber)}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {inside && (
                <p className="text-sm text-emerald-600 mb-2">
                    ● {inside.name} inside
                </p>
            )}

            {!queueQuery.isSuccess ? (
                <div className="border rounded-lg p-4">
                    <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-10 w-full bg-slate-100 rounded-full mt-3 animate-pulse" />
                </div>
            ) : next ? (
                <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-medium text-lg truncate">
                                {next.name}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {[next.age != null ? `${next.age}y` : null, next.sex].filter(Boolean).join(" · ")}
                            </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                            {waiting.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => move(0, 1)} aria-label="Move down">
                                    <ChevronDownIcon className="size-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPendingRemove(next)}
                                aria-label="Remove from queue"
                            >
                                <XIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <Button
                        className="w-full mt-3"
                        onClick={() => chooseMode(next)}
                        isLoading={starting || patientConsultationsQuery.isLoading}
                        disabled={starting || patientConsultationsQuery.isLoading}
                    >
                        <MicIcon className="size-4" /> Start Consultation
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No one's in the queue right now.
                </p>
            )}

            {waiting.length > 1 && (
                <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Up next</p>
                    <AnimatePresence initial={false}>
                        {waiting.slice(1).map((entry, idx) => {
                            const index = idx + 1;
                            return (
                                <motion.div
                                    key={entry.queue_entry_id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ layout: { duration: 0.22, ease: "easeInOut" } }}
                                    className="flex items-center gap-2 border rounded-lg px-3 py-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {entry.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {[entry.age != null ? `${entry.age}y` : null, entry.sex]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => move(index, -1)}
                                            aria-label="Move up"
                                        >
                                            <ChevronUpIcon className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={index >= waiting.length - 1}
                                            onClick={() => move(index, 1)}
                                            aria-label="Move down"
                                        >
                                            <ChevronDownIcon className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setPendingRemove(entry)}
                                            aria-label="Remove from queue"
                                        >
                                            <XIcon className="size-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <Dialog open={!!pendingRemove} onOpenChange={(open) => !open && setPendingRemove(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove from queue?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Remove {pendingRemove?.name} from today's queue? This
                        can't be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setPendingRemove(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            isLoading={removeMutation.isPending}
                            onClick={() => pendingRemove && removeMutation.mutate(pendingRemove.queue_entry_id)}
                        >
                            Remove
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={modeOpen} onOpenChange={setModeOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Start consultation for {next?.name}</DialogTitle>
                    </DialogHeader>
                    <ConsultationModeActions
                        onStartNew={() => next && start(next)}
                        onChooseFollowUp={() => {
                            setModeOpen(false);
                            setSourcePickerOpen(true);
                        }}
                        hasFollowUpSources={followUpSources.length > 0}
                        startingNew={starting && !startingSourceSessionId}
                        disabled={starting}
                    />
                </DialogContent>
            </Dialog>

            <FollowUpSourcePicker
                open={sourcePickerOpen}
                onOpenChange={setSourcePickerOpen}
                sources={followUpSources}
                startingSessionId={startingSourceSessionId}
                onStart={(source) => next && start(next, source.session_id)}
            />
        </div>
    );
}
