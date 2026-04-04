import {
    SoupIcon,
    Clock,

    Trash2,
    Info,
    PillIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import type { MeedicineType } from "@/types/prescription";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import DebouncedSearchSelect, { type Option } from "./debounced-search-select";

interface MedicineProps {
    medicine: MeedicineType,
    onRemove: (index: number) => void,
    onUpdate: (index: number, updatedMedicine: MeedicineType) => void,
    index: number,
    setIsEditing: (isEditing: boolean, index: number) => void,
    editingItemStatus: "add" | "update",
}

export default function MedicineEdit({ medicine, onRemove, onUpdate, index, setIsEditing, editingItemStatus }: MedicineProps) {
    const [routineMode, setRoutineMode] = useState<string>(medicine?.routine?.gapHours ? "interval" : "meal");
    const [medicineValue, setMedicineValue] = useState<Option>({
        label: medicine.name,
        value: medicine.name
    });
    const [gapHour, setGapHour] = useState<string>(medicine.routine?.gapHours ? medicine.routine.gapHours.toString() : "");

    const [notes, setNotes] = useState<string>(medicine.notes || "");
    const [dosage, setDosage] = useState<string>(medicine.dosage ?? "");

    const [breakfastTiming, setBreakfastTiming] = useState<"none" | "before" | "after">(medicine.routine?.beforeBreakfast ? "before" : medicine.routine?.afterBreakfast ? "after" : "none");
    const [lunchTiming, setLunchTiming] = useState<"none" | "before" | "after">(medicine.routine?.beforeLunch ? "before" : medicine.routine?.afterLunch ? "after" : "none");
    const [dinnerTiming, setDinnerTiming] = useState<"none" | "before" | "after">(medicine.routine?.beforeDinner ? "before" : medicine.routine?.afterDinner ? "after" : "none");

    const getPreview = () => {
        if (routineMode === "interval") return gapHour ? `${gapHour} hours Gap` : "N/A";
        const m = breakfastTiming !== "none" ? "1" : "0";
        const l = lunchTiming !== "none" ? "1" : "0";
        const d = dinnerTiming !== "none" ? "1" : "0";
        return `${m}+${l}+${d}`;
    };

    const handleSave = () => {
        if (!medicineValue) {
            onRemove(index);
        } else {
            onUpdate(index, {
                ...medicine,
                value: medicineValue.label,
                notes,
                dosage,
                routine: routineMode === "interval" ? {
                    gapHours: gapHour ? parseInt(gapHour) : undefined,
                } : {
                    beforeBreakfast: breakfastTiming === "before",
                    afterBreakfast: breakfastTiming === "after",
                    beforeLunch: lunchTiming === "before",
                    afterLunch: lunchTiming === "after",
                    beforeDinner: dinnerTiming === "before",
                    afterDinner: dinnerTiming === "after",
                },
            });
        }
        setIsEditing(false, index);
    };

    const handleCancel = () => {
        if (editingItemStatus === "add") {
            onRemove(index);
        }
        setIsEditing(false, index);
    }

    const fetchMedicine = async (query: string) => {
        const res = await api.post<{
            generic_name_strength: string;
        }[]>("/medicine/search", {
            query,
            search_in: "both",
        })

        return res.data.map(item => ({
            label: item.generic_name_strength ?? "",
            value: item.generic_name_strength ?? "",
        }));
    }

    return (
        <div className="bg-white border border-primary shadow-xl rounded-2xl overflow-hidden transition-all  duration-200">


            <div className="p-5 space-y-3">
                {/* Section 1: Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-1 space-y-1.5 flex flex-col">
                        <label className="text-[11px] font-semibold text-slate-500 ml-1">Medicine</label>
                        <DebouncedSearchSelect
                            value={medicineValue}
                            onChange={option => {
                                setMedicineValue(option || { label: "", value: "" })
                            }}
                            fetchOptions={fetchMedicine}
                            queryKeyBase={"medicine-search"}
                        />
                    </div>
                </div>

                {/* Section 2: Routine (The Focus) */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Routine Strategy</label>
                        <Tabs value={routineMode} onValueChange={setRoutineMode} className="w-auto">
                            <TabsList className="h-8 bg-slate-200/50 p-1">
                                <TabsTrigger value="meal" className="text-[10px] h-6 px-3">Meal Based</TabsTrigger>
                                <TabsTrigger value="interval" className="text-[10px] h-6 px-3">Interval</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className={cn("text-sm font-semibold tracking-wider ml-auto", routineMode === "meal" && "font-mono")}>
                            {getPreview()}
                        </div>
                    </div>

                    <div className="min-h-[60px] flex items-center justify-center">
                        {routineMode === "meal" ? (
                            <div className="flex gap-4">
                                <EnhancedMealSlot label="Morning" timing={breakfastTiming} setTiming={setBreakfastTiming} />
                                <EnhancedMealSlot label="Lunch" timing={lunchTiming} setTiming={setLunchTiming} />
                                <EnhancedMealSlot label="Night" timing={dinnerTiming} setTiming={setDinnerTiming} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-emerald-500" />
                                <span className="text-sm text-slate-600 font-medium">Every</span>
                                <Input
                                    value={gapHour}
                                    onChange={e => setGapHour(e.target.value)}
                                    type="number"
                                    className="w-24 h-8 text-center font-bold text-slate-900 border-slate-300 focus-visible:ring-emerald-500 pr-1!"
                                    autoFocus
                                />
                                <span className="text-sm text-slate-600 font-medium">Hours</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DOSAGE */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 ml-1 text-amber-600">
                        <PillIcon size={12} />
                        <label className="text-[11px] font-semibold uppercase">Dosage</label>
                    </div>
                    <Input
                        placeholder="e.g. 1 tablet"
                        className="h-10 text-sm border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-slate-200 shadow-sm"
                        value={dosage}
                        onChange={e => setDosage(e.target.value)}
                    />
                </div>

                {/* Section 3: Notes */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 ml-1 text-amber-600">
                        <Info size={12} />
                        <label className="text-[11px] font-semibold uppercase">Instructions</label>
                    </div>
                    <Input
                        placeholder="e.g. If pain persists, only after dinner..."
                        className="h-10 text-sm border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-slate-200 shadow-sm"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-t border-slate-100">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                    onClick={() => { onRemove(index); setIsEditing(false, index); }}
                >
                    <Trash2 className="size-3.5 mr-2" /> REMOVE
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-9 text-xs font-bold text-slate-500" onClick={handleCancel}>
                        CANCEL
                    </Button>
                    <Button size="sm" className="h-9 text-xs px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md" onClick={handleSave}>
                        DONE
                    </Button>
                </div>
            </div>
        </div>
    );
}

function EnhancedMealSlot({ label, timing, setTiming }: { label: string, timing: "none" | "before" | "after", setTiming: (value: "none" | "before" | "after") => void }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
            <div className="flex items-center p-0.5 bg-slate-200/50 border border-slate-200 rounded-lg shadow-inner">
                <button
                    onClick={() => setTiming(timing === "before" ? "none" : "before")}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${timing === "before" ? "bg-white text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        }`}
                >
                    PRE
                </button>
                <div className="px-2">
                    <SoupIcon size={14} className={timing === "none" ? "text-slate-300" : timing === "before" ? "text-amber-500" : "text-emerald-500"} />
                </div>
                <button
                    onClick={() => setTiming(timing === "after" ? "none" : "after")}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${timing === "after" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        }`}
                >
                    POST
                </button>
            </div>
        </div>
    );
}