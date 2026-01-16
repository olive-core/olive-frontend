import { PlusCircle, Trash2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

// Importing your specific types
import type {
    ListInfoFieldName,
    ListInfoType,
    ChiefComplaintType,
} from "@/types/prescription";

interface ListInfoProps {
    title: string;
    info: ListInfoType[];
    fieldName: ListInfoFieldName;
}

export default function ListInfo({ title, info, fieldName }: ListInfoProps) {
    const isDiagnosis = fieldName === "diagnosis";

    // --- DUMMY FUNCTIONALITIES ---
    const handleAdd = () => {
        console.log(`[Dummy] Add new item to ${fieldName}`);
        // When you implement the store, you will likely create a blank item here based on the fieldName
        // e.g., if diagnosis -> { name: "" }, if history -> { name: "", duration: "", notes: "" }
    };

    const handleUpdate = (index: number, updatedItem: ListInfoType) => {
        console.log(`[Dummy] Update item at index ${index} in ${fieldName}:`, updatedItem);
    };

    const handleRemove = (index: number) => {
        console.log(`[Dummy] Remove item at index ${index} from ${fieldName}`);
    };
    // -----------------------------

    return (
        <div
            className={`flex flex-col gap-2 p-2 rounded-xl transition-colors duration-300 
            ${isDiagnosis ? "bg-emerald-50/40 border-l-4 border-l-emerald-500 pl-3" : ""}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-1 px-1">
                <h3 className={`font-bold text-xs uppercase tracking-widest ${isDiagnosis ? "text-emerald-700" : "text-slate-500"}`}>
                    {title} {isDiagnosis && "• Priority"}
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
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
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
}

const InfoItem = ({ item, index, isDiagnosis, onUpdate, onRemove }: InfoItemProps) => {
    // If name is empty, assume it's a new item being added -> enter edit mode immediately
    const [isEditing, setIsEditing] = useState(item.name === "");

    return (
        <div
            className={`group relative transition-all duration-200 rounded-lg border 
                ${isEditing
                    ? "border-emerald-500 bg-white shadow-lg p-4 z-10"
                    : `p-3 cursor-pointer ${isDiagnosis
                        ? "bg-white/80 border-emerald-100 hover:border-emerald-300"
                        : "bg-slate-50 hover:bg-white border-transparent hover:border-slate-200"
                    }`
                }`}
            onClick={() => !isEditing && setIsEditing(true)}
        >
            {isEditing ? (
                <EditingItem
                    item={item}
                    index={index}
                    setIsEditing={setIsEditing}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                />
            ) : (
                <NonEditingItem
                    item={item}
                    index={index}
                    onRemove={onRemove}
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
}

const EditingItem = ({ item, index, setIsEditing, onUpdate, onRemove }: EditingItemProps) => {
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

    // Type Guards: Determine what fields are available to edit based on the item type
    const hasDuration = "duration" in localItem;
    // DiagnosisType strictly has no notes in your definition
    const hasNotes = "notes" in localItem;

    return (
        <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3">
                {/* Name Input - Always present */}
                <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Condition Name
                    </p>
                    <Input
                        autoFocus
                        className="h-9 text-sm"
                        value={localItem.name}
                        onChange={(e) => setLocalItem({ ...localItem, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
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
                        onClick={() => setIsEditing(false)}
                    >
                        CANCEL
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 text-xs font-bold bg-slate-900 hover:bg-slate-800 px-4 text-white"
                        onClick={handleSave}
                    >
                        UPDATE ITEM
                    </Button>
                </div>
            </div>
        </div>
    );
};

const NonEditingItem = ({ item, index, onRemove }: { item: ListInfoType; index: number; onRemove: (i: number) => void }) => {
    // Safely access properties using checking
    const duration = "duration" in item ? item.duration : null;
    const notes = "notes" in item ? item.notes : null;

    return (
        <div className="flex justify-between items-start pr-6">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-slate-800 text-[14px] leading-tight">
                        {item.name || <span className="text-slate-300 italic">Untitled</span>}
                    </span>
                    {duration && (
                        <span className="text-[11px] font-light text-emerald-600 uppercase tracking-tight">
                            — {duration}
                        </span>
                    )}
                </div>
                {notes && (
                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed italic">
                        {notes}
                    </p>
                )}
            </div>

            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
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