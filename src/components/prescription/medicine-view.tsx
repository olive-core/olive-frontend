import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { MeedicineType } from "@/types/prescription";
import MedicineCard from "./paper/medicine-card";

interface MedicineViewProps {
    medicine:     MeedicineType;
    onRemove:     (index: number) => void;
    index:        number;
    setIsEditing: (isEditing: boolean, index: number) => void;
}

export default function MedicineView({ medicine, onRemove, index, setIsEditing }: MedicineViewProps) {
    const handleRemove = (event: React.MouseEvent) => {
        event.stopPropagation();
        onRemove(index);
    };

    return (
        <div
            className="group cursor-pointer"
            onClick={() => setIsEditing(true, index)}
        >
            <div className="relative max-w-lg">
                <MedicineCard
                    tradeName={medicine.trade_name}
                    genericName={medicine.generic_name}
                    fallbackName={medicine.name}
                    dosage={medicine.dosage}
                    notes={medicine.notes}
                    reasoning={medicine.reasoning}
                    routine={medicine.routine}
                />

                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white"
                    onClick={handleRemove}
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
