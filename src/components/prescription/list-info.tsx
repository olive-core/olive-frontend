import { InfoIcon, PlusCircle, Trash2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

// Importing your specific types
import type {
    ListInfoFieldName,
    ListInfoType,
    ChiefComplaintType,
} from "@/types/prescription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import DebouncedSearchSelect from "./debounced-search-select";
import api from "@/lib/axios";

interface ListInfoProps {
    title: string;
    info: ListInfoType[];
    fieldName: ListInfoFieldName;
    addEmptyItem: () => void;
    updateItem: (index: number, data: Partial<ListInfoType>) => void;
    removeItem: (index: number) => void;
}

export default function ListInfo({ title, info, fieldName, addEmptyItem, updateItem, removeItem }: ListInfoProps) {
    const [editingItemStatus, setEditingItemStatus] = useState<{ index: number, status: "add" | "update" } | null>(null);

    const editingItemIndex = editingItemStatus ? editingItemStatus.index : null;
    const setEditingItemIndex = (index: number | null) => {
        if (index === null) {
            setEditingItemStatus(null);
        } else {
            const status = index >= info.length ? "add" : "update";
            setEditingItemStatus({ index, status });
        }
    }



    const isDiagnosis = fieldName === "diagnosis";

    const handleAdd = () => {
        addEmptyItem();
        setEditingItemIndex(info.length); // Set to the new item's index
    }

    return (
        <div
            className={`flex flex-col gap-2 p-2 rounded-xl transition-colors duration-300 
            ${isDiagnosis ? "bg-emerald-50/40 border-2 border-emerald-500 pl-3" : ""}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <h3 className={`font-bold text-xs uppercase tracking-widest ${isDiagnosis ? "text-emerald-700" : "text-slate-500"}`}>
                    {title}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-100/50"
                    onClick={handleAdd}
                >
                    <PlusCircle className="size-3 mr-1" /> ADD
                </Button>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-1.5">
                {info.map((item, index) => (
                    <InfoItem
                        key={`${fieldName}-${index}`}
                        index={index}
                        item={item}
                        isDiagnosis={isDiagnosis}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        editingItemIndex={editingItemIndex}
                        setEditingItemIndex={setEditingItemIndex}
                        editingItemStatus={editingItemStatus?.status || null}
                        fieldName={fieldName}
                    />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

interface InfoItemProps {
    item: ListInfoType;
    index: number;
    isDiagnosis: boolean;
    onUpdate: (index: number, item: ListInfoType) => void;
    onRemove: (index: number) => void;
    editingItemIndex: number | null;
    setEditingItemIndex: (index: number | null) => void;
    editingItemStatus: "add" | "update" | null;
    fieldName: ListInfoFieldName;
}

const InfoItem = ({ item, index, isDiagnosis, onUpdate, onRemove, editingItemIndex, setEditingItemIndex, editingItemStatus, fieldName }: InfoItemProps) => {

    const setIsEditing = (value: boolean) => {
        if (value) {
            setEditingItemIndex(index);
        } else {
            setEditingItemIndex(null);
        }
    }

    return (
        <div
            className={`group relative transition-all duration-200 rounded-lg border 
                ${editingItemIndex === index
                    ? "border-emerald-500 bg-white shadow-lg p-4 z-10"
                    : `py-1 px-2 cursor-pointer ${isDiagnosis
                        ? "bg-white/80 border-emerald-100 hover:border-emerald-300"
                        : "bg-muted hover:bg-accent border-border"
                    }`
                }`}
            onClick={() => setIsEditing(true)}
        >
            {editingItemIndex === index ? (
                <EditingItem
                    item={item}
                    index={index}
                    setIsEditing={setIsEditing}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    editingItemStatus={editingItemStatus}
                    fieldName={fieldName}
                />
            ) : (
                <NonEditingItem
                    item={item}
                    index={index}
                    onRemove={onRemove}
                    fieldName={fieldName}
                />
            )}
        </div>
    );
};

interface EditingItemProps {
    item: ListInfoType;
    index: number;
    setIsEditing: (value: boolean) => void;
    onUpdate: (index: number, item: ListInfoType) => void;
    onRemove: (index: number) => void;
    editingItemStatus: "add" | "update" | null;
    fieldName: ListInfoFieldName;
}

const FETCH_OPTION_ENDPOINTS: Record<ListInfoFieldName, string> = {
    "chief-complaint": "/chief-complaint-name/search",
    "history": "/history-name/search",
    "diagnosis": "/diagnosis-name/search",
    "investigation": "/investigation-name/search",
}


const EditingItem = ({ item, index, setIsEditing, onUpdate, onRemove, editingItemStatus, fieldName }: EditingItemProps) => {
    // Local state for the form inputs
    const [localItem, setLocalItem] = useState<ListInfoType>(item);
    const handleSave = () => {
        if (!localItem.name.trim()) {
            onRemove(index); // If empty name, delete it
        } else {
            onUpdate(index, localItem);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        // If adding a new item and canceling, remove it
        if (editingItemStatus === "add") {
            onRemove(index);
        }
        setIsEditing(false);
    }

    // Type Guards: Determine what fields are available to edit based on the item type
    const hasDuration = "duration" in localItem;
    // DiagnosisType strictly has no notes in your definition
    const hasNotes = "notes" in localItem;

    const fetchOptions = async (query: string) => {
        const res = await api.get<{ name: string }[]>(
            `${FETCH_OPTION_ENDPOINTS[fieldName]}?q=${query}`
        )

        return res.data.map(item => ({
            label: item.name,
            value: item.name,
        }))
    }

    return (
        <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3">
                {/* Name Input - Always present */}
                <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Name
                    </p>

                    <DebouncedSearchSelect
                        value={{
                            label: localItem.name,
                            value: localItem.name,
                        }}
                        onChange={option => {
                            setLocalItem({
                                ...localItem, name: option?.value || ""
                            })
                        }}
                        fetchOptions={fetchOptions}
                        queryKeyBase={`${fieldName}-search`}
                    />

                    {/* <Input
                        autoFocus
                        className="h-9 text-sm"
                        value={localItem.name}
                        onChange={(e) => setLocalItem({ ...localItem, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay blur so click registers on suggestions
                    /> */}

                    {/* Custom Dropdown Menu */}
                    {/* {isFocused && filteredSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
                            {filteredSuggestions.map((name) => (
                                <li
                                    key={name}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 text-slate-700"
                                    onMouseDown={() => {
                                        setLocalItem({ ...localItem, name: name });
                                        setIsFocused(false);
                                    }}
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )} */}
                </div>

                {/* Duration Input - Conditional */}
                {hasDuration && (
                    <div className="w-1/3 space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            Timeline
                        </p>
                        <Input
                            className="h-9 text-sm"
                            // We must cast or assert here because TS knows hasDuration is true, 
                            // but localItem is still the Union type in the eyes of the compiler for access
                            value={(localItem as ChiefComplaintType).duration || ""}
                            placeholder="e.g. 5 days"
                            onChange={(e) => setLocalItem({ ...localItem, duration: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        />
                    </div>
                )}
            </div>

            {/* Notes Input - Conditional */}
            {hasNotes && (
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Clinical Notes
                    </p>
                    <Input
                        className="h-9 text-sm"
                        value={(localItem as ChiefComplaintType).notes || ""}
                        placeholder="Additional details..."
                        onChange={(e) => setLocalItem({ ...localItem, notes: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-2"
                    onClick={() => {
                        onRemove(index);
                        setIsEditing(false);
                    }}
                >
                    <Trash2 className="size-3.5 mr-1.5" /> REMOVE
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-bold text-slate-500"
                        onClick={handleCancel}
                    >
                        CANCEL
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 text-xs font-bold bg-slate-900 hover:bg-slate-800 px-4 text-white"
                        onClick={handleSave}
                    >
                        DONE
                    </Button>
                </div>
            </div>
        </div>
    );
};

const NonEditingItem = ({ item, index, onRemove, fieldName }: { item: ListInfoType; index: number; onRemove: (i: number) => void, fieldName: ListInfoFieldName }) => {
    // Safely access properties using checking
    const duration = "duration" in item ? item.duration : null;
    const notes = "notes" in item ? item.notes : null;
    const confidence = "confidence" in item ? item.confidence : null;
    const icd_code = "icd_code" in item ? item.icd_code : null;
    const clinical_reasoning = "clinical_reasoning" in item ? item.clinical_reasoning : null;
    const investigation_reason = "notes" in item && fieldName === "investigation" ? item.notes : null;
    const investigation_priority = "priority" in item ? item.priority : null;

    const getPriorityStyle = (priority: string | null | undefined) => {
        switch (priority?.toLowerCase()) {
            case "urgent":
                return {
                    label: "Urgent",
                    badge: "bg-rose-50 text-rose-600",
                    border: "border-rose-400"
                };
            case "routine":
                return {
                    label: "Routine",
                    badge: "bg-amber-50 text-amber-600",
                    border: "border-amber-400"
                };
            case "low":
                return {
                    label: "Low",
                    badge: "bg-emerald-50 text-emerald-600",
                    border: "border-emerald-400"
                };
            default:
                return null;
        }
    };

    const priorityStyle = getPriorityStyle(investigation_priority);

    return (
        <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                    <span className="text-slate-800 text-[14px] leading-tight">
                        {item.name || <span className="text-slate-300 italic">Untitled</span>}
                    </span>
                    {duration && (
                        <span className="text-[11px] text-emerald-600 uppercase tracking-tight">
                            — {duration}
                        </span>
                    )}
                </div>
                {notes && !investigation_reason && (
                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic">
                        {notes}
                    </p>
                )}

                {(icd_code || confidence || clinical_reasoning || investigation_reason || investigation_priority) && (
                    <div className="flex flex-col gap-1.5 mt-1.5 border-l-2 border-emerald-400 pl-2">

                        {/* Meta Row: ICD, Confidence, & Reasoning Tooltip */}
                        <div className="flex items-center gap-3">
                            {icd_code && (
                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {icd_code}
                                </span>
                            )}

                            {confidence && (
                                <div className="flex items-center gap-1.5" title={`Confidence: ${confidence}%`}>
                                    {/* Visual Confidence Bar */}
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${confidence >= 85 ? 'bg-emerald-500' :
                                                confidence >= 60 ? 'bg-amber-400' :
                                                    'bg-rose-500'
                                                }`}
                                            style={{ width: `${Math.min(Math.max(confidence, 0), 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">
                                        {confidence}%
                                    </span>
                                </div>
                            )}

                            {/* Investigation Priority */}
                            {priorityStyle && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priorityStyle.badge}`}>
                                    {priorityStyle.label}
                                </span>
                            )}

                            {/* Reasoning Tooltip */}
                            {(clinical_reasoning || investigation_reason) && (
                                <TooltipProvider>
                                    <Tooltip delayDuration={200}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center cursor-help"
                                            >
                                                {/* Assuming you are using lucide-react or similar for icons */}
                                                <InfoIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[250px] bg-slate-800 text-white p-2 rounded shadow-lg text-[12px] leading-relaxed">
                                            <p>
                                                <span className="text-emerald-400 font-semibold mr-1">Reasoning:</span>
                                                {clinical_reasoning || investigation_reason}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                )}

            </div>

            <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-700"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                }}
            >
                <XIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};