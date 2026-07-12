import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronUpIcon,
    PlusIcon,
    XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listQueue, removeQueueEntry, reorderQueue } from "@/lib/attendant-queue";
import { applyOptimisticReorder } from "@/lib/queue-reorder";
import { useQueueStream } from "@/hooks/use-queue-stream";
import { handleError } from "@/lib/utils";
import type { QueueEntry } from "@/types/attendant-queue";

interface QueueViewProps {
    chamberId: string;
    title: string;
    subtitle?: string;
    onAdd: () => void;
    onBack?: () => void;
}

export default function QueueView({ chamberId, title, subtitle, onAdd, onBack }: QueueViewProps) {
    const queryClient = useQueryClient();

    const { data: entries = [], isLoading } = useQuery({
        queryKey: ["queue", chamberId],
        queryFn: () => listQueue(chamberId),
    });

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["queue", chamberId] });
    }, [queryClient, chamberId]);
    useQueueStream(chamberId, refresh);

    const inside = entries.filter((entry) => entry.status === "in_room");
    const waiting = entries.filter((entry) => entry.status === "waiting");

    const removeMutation = useMutation({ mutationFn: removeQueueEntry, onSuccess: refresh });
    const reorderMutation = useMutation({
        mutationFn: (ids: string[]) => reorderQueue(chamberId, ids),
        onMutate: (ids) => applyOptimisticReorder(queryClient, chamberId, ids),
        onError: (error, _ids, context) => {
            context?.rollback();
            handleError(error, "Could not reorder the queue");
        },
        onSettled: refresh,
    });

    const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= waiting.length) return;
        const ids = waiting.map((entry) => entry.queue_entry_id);
        [ids[index], ids[target]] = [ids[target], ids[index]];
        reorderMutation.mutate(ids);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to chambers">
                        <ChevronLeftIcon className="size-5" />
                    </Button>
                )}
                <div>
                    <h2 className="text-lg font-medium">{title}</h2>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>

            {inside.map((entry) => (
                <QueueRow key={entry.queue_entry_id} entry={entry} inside />
            ))}

            {isLoading ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
            ) : waiting.length === 0 && inside.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No one waiting yet.</p>
            ) : (
                <AnimatePresence initial={false}>
                    {waiting.map((entry, index) => (
                        <motion.div
                            key={entry.queue_entry_id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ layout: { duration: 0.22, ease: "easeInOut" } }}
                        >
                            <QueueRow
                                entry={entry}
                                position={index + 1}
                                onUp={index > 0 ? () => move(index, -1) : undefined}
                                onDown={index < waiting.length - 1 ? () => move(index, 1) : undefined}
                                onRemove={() => removeMutation.mutate(entry.queue_entry_id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}

            <Button className="w-full mt-4" onClick={onAdd}>
                <PlusIcon className="size-4" /> Add Patient
            </Button>
        </div>
    );
}

interface QueueRowProps {
    entry: QueueEntry;
    position?: number;
    inside?: boolean;
    onUp?: () => void;
    onDown?: () => void;
    onRemove?: () => void;
}

function QueueRow({ entry, position, inside, onUp, onDown, onRemove }: QueueRowProps) {
    const detail = [entry.age != null ? `${entry.age}y` : null, entry.sex]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-2">
            <span className="w-6 text-center text-sm text-muted-foreground">
                {inside ? "●" : position}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {entry.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                    {inside ? (
                        <span className="text-emerald-600 font-medium">In room</span>
                    ) : (
                        <span className="text-amber-600 font-medium">Waiting</span>
                    )}
                    {detail ? ` · ${detail}` : ""}
                </p>
            </div>
            {inside ? (
                <span className="text-xs text-emerald-600 font-medium">inside</span>
            ) : (
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" disabled={!onUp} onClick={onUp} aria-label="Move up">
                        <ChevronUpIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={!onDown} onClick={onDown} aria-label="Move down">
                        <ChevronDownIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove (no-show)">
                        <XIcon className="size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
