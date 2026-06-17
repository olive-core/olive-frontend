import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { MeedicineType } from "@/types/prescription";
import api from "@/lib/axios";
import DebouncedSearchSelect, { type Option } from "./debounced-search-select";
import RxForm from "./rx/rx-form";
import { RX_TYPE_CONFIG } from "./rx/rx-type-config";
import {
    CATEGORY_LABELS,
    MEDICINE_CATEGORIES,
    getCategoryDefaults,
    getRxArchetype,
    normalizeDosageForm,
    type MedicineCategory,
} from "@/lib/dosage-form";
import { composeDose } from "@/lib/rx-compose";
import { routineFromSchedule, scheduleFromRoutine } from "@/lib/rx-format";

interface MedicineProps {
    medicine: MeedicineType;
    onRemove: (index: number) => void;
    onUpdate: (index: number, updatedMedicine: MeedicineType) => void;
    index: number;
    setIsEditing: (isEditing: boolean, index: number) => void;
    editingItemStatus: "add" | "update";
}

// Switching type re-seeds route / site / dose unit from the category defaults, keeping any
// dose amount, and only keeps a dose object for types that have an explicit dose field.
function applyType(medicine: MeedicineType, category: MedicineCategory): MeedicineType {
    const defaults = getCategoryDefaults(category);
    const config = RX_TYPE_CONFIG[getRxArchetype(category)];
    return {
        ...medicine,
        type: category,
        route: defaults.route,
        site: defaults.site,
        dose: config.doseMode === "explicit" ? { amount: medicine.dose?.amount, unit: defaults.doseUnit } : undefined,
    };
}

const fetchMedicine = async (query: string): Promise<Option[]> => {
    const res = await api.get<{
        generic_name_strength: string;
        trade_name: string;
        dosage_form?: string;
    }[]>(`/medicine/search?q=${query}&search_in=both`);

    return res.data.map(item => ({
        label: item.trade_name ?? item.generic_name_strength ?? "",
        value: item.trade_name ?? item.generic_name_strength ?? "",
        trade_name: item.trade_name,
        generic_name: item.generic_name_strength,
        dosage_form: item.dosage_form,
    }));
};

export default function MedicineEdit({ medicine, onRemove, onUpdate, index, setIsEditing, editingItemStatus }: MedicineProps) {
    const [working, setWorking] = useState<MeedicineType>(() => ({
        ...medicine,
        schedule: medicine.schedule ?? scheduleFromRoutine(medicine.routine),
    }));

    const update = (patch: Partial<MeedicineType>) => setWorking(prev => ({ ...prev, ...patch }));

    const handleMedicineSelect = (option: Option | null) => {
        if (!option) {
            update({ name: "", value: "", trade_name: undefined, generic_name: undefined });
            return;
        }
        const category = normalizeDosageForm(option.dosage_form);
        setWorking(prev => ({
            ...applyType(prev, category),
            name: option.label,
            value: option.value,
            trade_name: option.trade_name,
            generic_name: option.generic_name,
            dosage_form: option.dosage_form,
        }));
    };

    const handleSave = () => {
        if (!working.name && !working.value) {
            onRemove(index);
        } else {
            const composed = composeDose(working);
            onUpdate(index, {
                ...working,
                dosage: composed || working.dosage,
                routine: routineFromSchedule(working.schedule),
                frequencyCode: working.schedule?.code,
            });
        }
        setIsEditing(false, index);
    };

    const handleCancel = () => {
        if (editingItemStatus === "add") onRemove(index);
        setIsEditing(false, index);
    };

    const hasMedicine = Boolean(working.name || working.value);
    const config = RX_TYPE_CONFIG[getRxArchetype(working.type)];

    return (
        <div className="bg-white border border-primary shadow-xl rounded-2xl overflow-hidden transition-all duration-200">
            <div className="p-4 sm:p-5 space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 ml-1">Medicine</label>
                    <DebouncedSearchSelect
                        value={{ label: working.name, value: working.value || working.name, trade_name: working.trade_name, generic_name: working.generic_name }}
                        onChange={handleMedicineSelect}
                        fetchOptions={fetchMedicine}
                        queryKeyBase={"medicine-search"}
                    />
                </div>

                {hasMedicine ? (
                    <>
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold text-slate-500 ml-1 shrink-0">Type</label>
                            <Select value={working.type} onValueChange={value => setWorking(prev => applyType(prev, value as MedicineCategory))}>
                                <SelectTrigger className="h-9 w-full max-w-xs">
                                    <SelectValue placeholder="Auto / Custom" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MEDICINE_CATEGORIES.map(category => (
                                        <SelectItem key={category} value={category}>{CATEGORY_LABELS[category]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <RxForm medicine={working} config={config} onChange={update} />
                    </>
                ) : (
                    <p className="text-xs text-slate-400 ml-1">Search and select a medicine to reveal its prescription fields.</p>
                )}
            </div>

            <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-t border-slate-100">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                    onClick={() => { onRemove(index); setIsEditing(false, index); }}
                >
                    <Trash2 className="size-3.5 mr-2" /> Remove
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-9 text-xs font-bold text-slate-500" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button size="sm" className="h-9 text-xs px-6 font-bold shadow-md" onClick={handleSave}>
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
}
