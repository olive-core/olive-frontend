import {
    SoupIcon,
    Clock,
    Utensils,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import MedicineSelect from "./medicine-select";
import DosageSelect from "./dosage-select";

export default function Medicine() {
    const [routineMode, setRoutineMode] = useState<string>("meal");

    return (
        <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-md text-emerald-600">Medicine (Rx)</h3>
            </div>

            {/* Entry Panel */}
            <div className="bg-slate-50 border rounded-xl p-4 space-y-4 relative group">

                <div className="flex flex-col sm:flex-row gap-4 mb-2 items-end sm:items-center justify-start">
                    <div className="">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Medicine</label>
                        <MedicineSelect />
                    </div>
                    <div className="">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dosage</label>
                        <DosageSelect />
                    </div>
                </div>

                {/* Fixed Height Routine Container */}
                <div className="flex flex-col sm:flex-row gap-6 items-center min-h-[85px]">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Routine Type</label>
                        <Tabs value={routineMode} onValueChange={setRoutineMode} className="w-[200px]">
                            <TabsList className="grid w-full grid-cols-2 h-9">
                                <TabsTrigger value="meal" className="text-xs">
                                    <Utensils className="size-3 mr-1" /> Meal
                                </TabsTrigger>
                                <TabsTrigger value="interval" className="text-xs">
                                    <Clock className="size-3 mr-1" /> Interval
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex-1 h-full flex flex-col justify-end">
                        {routineMode === "meal" ? (
                            <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                {/* <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Meal Timing</label> */}
                                <div className="flex items-center gap-4">
                                    <EnhancedMealSlot label="Morning" />
                                    <EnhancedMealSlot label="Lunch" />
                                    <EnhancedMealSlot label="Night" />
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Hours Gap</label>
                                <div className="flex items-center gap-3 h-[58px]">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="x"
                                            className="w-20 h-10 font-bold text-emerald-600"
                                            max={24}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 italic">Repeat every interval</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-3 border-t flex items-center gap-3">
                    <Input
                        placeholder="Additional notes (e.g. ব্যথা হলে খাবেন)"
                        className="h-10 text-sm bg-white border-slate-200"
                    />
                    {/* <Button
                        className="bg-emerald-600 hover:bg-emerald-700 h-10 font-semibold shadow-lg shadow-emerald-600/20"
                        onClick={() => console.log("Medicine added to list")}
                    >
                        <Check className="size-4" /> Keep
                    </Button> */}
                    <Button
                        size="icon"
                        variant={"destructive"}
                        onClick={() => console.log("Medicine removed from list")}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function EnhancedMealSlot({ label }: { label: string }) {
    const [timing, setTiming] = useState<"none" | "before" | "after">("none");

    return (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>

            <div className="flex border rounded-lg overflow-hidden h-10 bg-white shadow-sm">

                <button
                    onClick={() => setTiming(timing === "before" ? "none" : "before")}
                    className={`px-2 text-[10px] font-bold transition-colors border-r ${timing === "before" ? "bg-amber-500 text-white" : "text-slate-400 hover:bg-slate-50"
                        }`}
                >
                    PRE
                </button>
                <div className={`px-2 flex items-center justify-center ${timing !== "none" ? "bg-white" : "bg-slate-50 opacity-30"}`}>
                    <SoupIcon className={`size-4 ${timing === "before" ? "text-amber-500" : timing === "after" ? "text-emerald-600" : "text-slate-400"}`} />
                </div>
                <button
                    onClick={() => setTiming(timing === "after" ? "none" : "after")}
                    className={`px-2 text-[10px] font-bold transition-colors border-l ${timing === "after" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-50"
                        }`}
                >
                    POST
                </button>
            </div>
        </div>
    );
}