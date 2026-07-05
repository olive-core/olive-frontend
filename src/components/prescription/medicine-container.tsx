import { usePrescriptionStore } from "@/stores/prescription-store"
import { Button } from "../ui/button";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import MedicineEdit from "./medicine-edit";
import MedicineView from "./medicine-view";
import UnresolvedMedicineCard from "./unresolved-medicine-card";
import type { MeedicineType } from "@/types/prescription";
import { cn } from "@/lib/utils";

export const MedicineContainer = () => {

    const {
        medicine,
        unresolvedMedicines,
        addEmptyMedicine,
        updateMedicine,
        removeMedicine,
        moveMedicine,
        resolveUnresolvedMedicine,
        dismissUnresolvedMedicine,
        isRevertingTemplate,
    } = usePrescriptionStore();

    const [editingItemStatus, setEditingItemStatus] = useState<{ index: number, status: "add" | "update" } | null>(null);

    const editingItemIndex = editingItemStatus ? editingItemStatus.index : null;

    const setEditingItemIndex = (index: number | null) => {
        if (index === null) {
            setEditingItemStatus(null);
        } else {
            const status = index >= medicine.length ? "add" : "update";
            setEditingItemStatus({ index, status });
        }
    }

    const setIsEditing = (value: boolean, index: number) => {
        if (value) {
            setEditingItemIndex(index);
        } else {
            setEditingItemIndex(null);
        }
    }

    const handleAdd = () => {
        // Reuse an existing name-less row instead of stacking up empty medicines.
        const emptyIndex = medicine.findIndex(med => !med.name && !med.value);
        if (emptyIndex >= 0) {
            setEditingItemStatus({ index: emptyIndex, status: "add" });
            return;
        }
        addEmptyMedicine();
        setEditingItemStatus({ index: medicine.length, status: "add" }); // the newly appended row
    }

    const handleResolveMention = (mentionIndex: number) => {
        const newIndex = resolveUnresolvedMedicine(mentionIndex);
        setEditingItemStatus({ index: newIndex, status: "add" });
    }

    const renderMedicine = (med: MeedicineType, idx: number) => {
        if (editingItemIndex === idx) {
            return (
                (
                    <MedicineEdit
                        key={idx}
                        medicine={med}
                        onRemove={removeMedicine}
                        onUpdate={updateMedicine}
                        index={idx}
                        setIsEditing={setIsEditing}
                        editingItemStatus={editingItemStatus!.status}
                    />
                )
            )
        } else {
            return (
                <MedicineView
                    key={idx}
                    medicine={med}
                    onRemove={removeMedicine}
                    index={idx}
                    setIsEditing={setIsEditing}
                    onMoveUp={idx > 0 ? () => moveMedicine(idx, idx - 1) : undefined}
                    onMoveDown={idx < medicine.length - 1 ? () => moveMedicine(idx, idx + 1) : undefined}
                />
            )
        }
    }


    return (
        <div className={cn("mb-4 transition-opacity duration-300", isRevertingTemplate ? "opacity-0" : "opacity-100")}>
            <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-md text-emerald-600">Medicine (Rx)</h3>
                </div>
                <div className="flex flex-col gap-2">
                    {medicine.map((med, idx) => renderMedicine(med, idx))}
                    {unresolvedMedicines.map((heardAs, idx) => (
                        <UnresolvedMedicineCard
                            key={`unresolved-${idx}`}
                            heardAs={heardAs}
                            onResolve={() => handleResolveMention(idx)}
                            onDismiss={() => dismissUnresolvedMedicine(idx)}
                        />
                    ))}
                </div>
            </div>

            <Button variant={"outline"} className="flex items-center gap-2 mt-4 cursor-pointer text-emerald-600 hover:text-emerald-700" onClick={handleAdd}>
                <PlusCircleIcon /> Add Medicine
            </Button>
        </div>
    )
}