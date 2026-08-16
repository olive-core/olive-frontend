import { ChevronDown, ChevronUp, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { MeedicineType } from "@/types/prescription";
import MedicineCard from "./paper/medicine-card";
import { formatDuration, formatSchedule } from "@/lib/rx-format";
import { categoryLabel } from "@/lib/dosage-form";
import { cn } from "@/lib/utils";

const ACTION_BUTTON = "size-11 sm:size-7 cursor-pointer text-slate-400 hover:text-slate-700 disabled:opacity-25";

interface MedicineViewProps {
    medicine:     MeedicineType;
    onRemove:     (index: number) => void;
    index:        number;
    setIsEditing: (isEditing: boolean, index: number) => void;
    onMoveUp?:    () => void;
    onMoveDown?:  () => void;
}

export default function MedicineView({ medicine, onRemove, index, setIsEditing, onMoveUp, onMoveDown }: MedicineViewProps) {
    const stop = (event: React.MouseEvent, action: () => void) => {
        event.stopPropagation();
        action();
    };

    return (
        // On a phone the actions sit under the card rather than in a rail beside it: a
        // finger-sized rail costs the card a quarter of the column, which is exactly the
        // width the medicine name needs.
        <div
            className="group flex cursor-pointer flex-col gap-1 sm:flex-row sm:items-stretch sm:gap-1.5"
            onClick={() => setIsEditing(true, index)}
        >
            <MedicineCard
                className="w-full max-w-none sm:flex-1"
                typeLabel={categoryLabel(medicine.type)}
                tradeName={medicine.trade_name}
                genericName={medicine.generic_name}
                fallbackName={medicine.name}
                dosage={medicine.dosage}
                frequencyText={formatSchedule(medicine.schedule, medicine.routine)}
                durationText={formatDuration(medicine.duration)}
                notes={medicine.instructions ?? medicine.notes}
                reasoning={medicine.reasoning}
            />

            {/* Finger-sized on a phone: these sit against a card that opens the editor when
                tapped, so a near miss on Remove or a reorder arrow used to edit instead. */}
            <div className="flex shrink-0 items-center justify-end gap-1 sm:flex-col sm:justify-center sm:gap-0.5">
                <Button
                    size="icon"
                    variant="ghost"
                    disabled={!onMoveUp}
                    aria-label="Move up"
                    className={ACTION_BUTTON}
                    onClick={(e) => onMoveUp && stop(e, onMoveUp)}
                >
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    disabled={!onMoveDown}
                    aria-label="Move down"
                    className={ACTION_BUTTON}
                    onClick={(e) => onMoveDown && stop(e, onMoveDown)}
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove medicine"
                    className={cn(ACTION_BUTTON, "hover:text-rose-500")}
                    onClick={(e) => stop(e, () => onRemove(index))}
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
