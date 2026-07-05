import { ChevronDown, ChevronUp, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { MeedicineType } from "@/types/prescription";
import MedicineCard from "./paper/medicine-card";
import { formatDuration, formatSchedule } from "@/lib/rx-format";
import { categoryLabel } from "@/lib/dosage-form";

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
        <div
            className="group flex items-stretch gap-1.5 cursor-pointer"
            onClick={() => setIsEditing(true, index)}
        >
            <MedicineCard
                className="flex-1 max-w-none"
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

            <div className="flex flex-col justify-center gap-0.5 shrink-0">
                <Button
                    size="icon"
                    variant="ghost"
                    disabled={!onMoveUp}
                    aria-label="Move up"
                    className="h-7 w-7 cursor-pointer text-slate-400 hover:text-slate-700 disabled:opacity-25"
                    onClick={(e) => onMoveUp && stop(e, onMoveUp)}
                >
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    disabled={!onMoveDown}
                    aria-label="Move down"
                    className="h-7 w-7 cursor-pointer text-slate-400 hover:text-slate-700 disabled:opacity-25"
                    onClick={(e) => onMoveDown && stop(e, onMoveDown)}
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove medicine"
                    className="h-7 w-7 cursor-pointer text-slate-400 hover:text-rose-500"
                    onClick={(e) => stop(e, () => onRemove(index))}
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
