import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { MedicineSchedule, MeedicineType } from "@/types/prescription";
import { useMedicineSearch } from "@/hooks/use-medicine-search";
import EditSurface from "./editor/edit-surface";
import DebouncedSearchSelect, { type Option } from "./debounced-search-select";
import RxForm from "./rx/rx-form";
import Combobox from "./rx/combobox";
import { RX_TYPE_CONFIG } from "./rx/rx-type-config";
import {
    CATEGORY_LABELS,
    MEDICINE_CATEGORIES,
    getCategoryDefaults,
    getFormHints,
    getRxArchetype,
    normalizeDosageForm,
    type MedicineCategory,
    type RxDefaults,
} from "@/lib/dosage-form";
import { composeDose } from "@/lib/rx-compose";
import { routineFromSchedule, scheduleFromRoutine } from "@/lib/rx-format";

const TYPE_OPTIONS = MEDICINE_CATEGORIES.map(category => ({ value: category, label: CATEGORY_LABELS[category] }));

interface MedicineProps {
    medicine: MeedicineType;
    onRemove: (index: number) => void;
    onUpdate: (index: number, updatedMedicine: MeedicineType) => void;
    index: number;
    setIsEditing: (isEditing: boolean, index: number) => void;
    editingItemStatus: "add" | "update";
}

// Oral types default to "after meal" so the doctor rarely has to set it; others start unset.
function seedSchedule(category: MedicineCategory): MedicineSchedule {
    const config = RX_TYPE_CONFIG[getRxArchetype(category)];
    return config.frequencyMode === "meal" || config.showMealTiming ? { timing: "after" } : {};
}

// Switching medicine or type fully re-seeds the type-specific fields from the category defaults
// (plus any smart hints), so a previous type's dose / schedule / instructions never leak through.
function applyType(medicine: MeedicineType, category: MedicineCategory, hints: RxDefaults = {}): MeedicineType {
    const defaults = { ...getCategoryDefaults(category), ...hints };
    const config = RX_TYPE_CONFIG[getRxArchetype(category)];
    return {
        ...medicine,
        type: category,
        route: defaults.route,
        site: defaults.site,
        dose: config.doseMode === "explicit" ? { amount: undefined, unit: defaults.doseUnit, diluent: defaults.diluent } : undefined,
        schedule: seedSchedule(category),
        duration: {},
        instructions: "",
        frequencyCode: undefined,
    };
}

export default function MedicineEdit({ medicine, onRemove, onUpdate, index, setIsEditing, editingItemStatus }: MedicineProps) {
    const { search: searchMedicines, ready: isIndexReady } = useMedicineSearch();
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
        setWorking(prev => {
            const sameMedicine = prev.value === option.value && prev.name === option.label;
            const base = sameMedicine ? prev : applyType(prev, category, getFormHints(option.dosage_form, category));
            return {
                ...base,
                name: option.label,
                value: option.value,
                trade_name: option.trade_name,
                generic_name: option.generic_name,
                dosage_form: option.dosage_form,
            };
        });
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
        // No overflow-hidden on the card: it would clip the medicine search dropdown.
        // The footer rounds its own bottom corners instead, since it is the only child
        // sitting flush against the card edge.
        <EditSurface
            title="Medicine"
            onCommit={handleSave}
            className="bg-white border border-primary shadow-xl rounded-2xl transition-all duration-200"
            footer={
                <MedicineEditActions
                    onRemove={() => { onRemove(index); setIsEditing(false, index); }}
                    onCancel={handleCancel}
                    onSave={handleSave}
                />
            }
        >
            <div className="p-4 sm:p-5 space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 ml-1">Medicine</label>
                    <DebouncedSearchSelect
                        value={{ label: working.name, value: working.value || working.name, trade_name: working.trade_name, generic_name: working.generic_name }}
                        onChange={handleMedicineSelect}
                        fetchOptions={searchMedicines}
                        minLength={1}
                        debounceTime={120}
                        queryKeyBase={["medicine-search", isIndexReady]}
                    />
                </div>

                {hasMedicine && working.generic_name && (
                    <div className="ml-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                        <span className="font-semibold text-slate-700">{working.generic_name}</span>
                        {working.dosage_form && <span className="text-slate-400">· {working.dosage_form}</span>}
                    </div>
                )}

                {hasMedicine ? (
                    <>
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold text-slate-500 ml-1 shrink-0">Type</label>
                            <div className="w-full max-w-xs">
                                <Combobox
                                    value={working.type ?? ""}
                                    onChange={value => setWorking(prev => applyType(prev, value as MedicineCategory))}
                                    options={TYPE_OPTIONS}
                                    placeholder="Auto / Custom"
                                    searchPlaceholder="Search type..."
                                />
                            </div>
                        </div>

                        <RxForm medicine={working} config={config} onChange={update} />
                    </>
                ) : (
                    <p className="text-xs text-slate-400 ml-1">Search and select a medicine to reveal its prescription fields.</p>
                )}
            </div>
        </EditSurface>
    );
}

interface MedicineEditActionsProps {
    onRemove: () => void;
    onCancel: () => void;
    onSave:   () => void;
}

function MedicineEditActions({ onRemove, onCancel, onSave }: MedicineEditActionsProps) {
    return (
        <div className="bg-slate-50 px-5 py-3 flex flex-wrap justify-between items-center gap-2 border-t border-slate-100 rounded-b-2xl">
            <Button
                variant="ghost"
                size="sm"
                className="h-11 sm:h-8 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                onClick={onRemove}
            >
                <Trash2 className="size-3.5 mr-2" /> Remove
            </Button>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-11 sm:h-9 text-xs font-bold text-slate-500" onClick={onCancel}>
                    Cancel
                </Button>
                <Button size="sm" className="h-11 sm:h-9 text-xs px-6 font-bold shadow-md" onClick={onSave}>
                    Done
                </Button>
            </div>
        </div>
    );
}
