import { usePrescriptionStore } from "@/stores/prescription-store"
import { Button } from "../ui/button";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import MedicineEdit from "./medicine-edit";
import MedicineView from "./medicine-view";
import type { MeedicineType } from "@/types/prescription";

export const MedicineContainer = () => {

    const {
        medicine,
        addEmptyMedicine,
        updateMedicine,
        removeMedicine,
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
        addEmptyMedicine();
        setEditingItemIndex(medicine.length); // Set to the new item's index
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
                />
            )
        }
    }


    return (
        <div className="mb-4">
            <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-md text-emerald-600">Medicine (Rx)</h3>
                </div>
                <div className="flex flex-col gap-2">
                    {medicine.map((med, idx) => renderMedicine(med, idx))}
                </div>
            </div>

            <Button variant={"outline"} className="flex items-center gap-2 mt-4 cursor-pointer text-emerald-600 hover:text-emerald-700" onClick={handleAdd}>
                <PlusCircleIcon /> Add Medicine
            </Button>
        </div>
    )
}