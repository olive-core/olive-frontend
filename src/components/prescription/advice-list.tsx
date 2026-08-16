import { useState } from "react";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { SectionMemoryButton } from "@/components/memory/apply-memory-button";
import MemoryUndoBar from "@/components/memory/memory-undo-bar";

interface AdviceListProps {
    value: string[];
    onChange: (val: string[]) => void;
}

export default function AdviceList({ value, onChange }: AdviceListProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingStatus, setEditingStatus] = useState<"add" | "update" | null>(null);
    const [tempValue, setTempValue] = useState("");

    const resetEditing = () => {
        setEditingIndex(null);
        setEditingStatus(null);
        setTempValue("");
    };

    const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

    const handleAdd = () => {
        onChange([...value, ""]);
        setEditingIndex(value.length);
        setEditingStatus("add");
        setTempValue("");
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditingStatus("update");
        setTempValue(value[index]);
    };

    // Empty text removes the item — mirrors the chief-complaint / medicine editors.
    const handleSave = () => {
        if (editingIndex === null) return;
        const trimmed = tempValue.trim();
        if (!trimmed) {
            removeAt(editingIndex);
        } else {
            const updated = [...value];
            updated[editingIndex] = trimmed;
            onChange(updated);
        }
        resetEditing();
    };

    // Cancelling a brand-new item discards it instead of leaving an empty entry behind.
    const handleCancel = () => {
        if (editingStatus === "add" && editingIndex !== null) {
            removeAt(editingIndex);
        }
        resetEditing();
    };

    const handleDelete = (index: number) => {
        removeAt(index);
        if (editingIndex === index) resetEditing();
    };

    return (
        <div className="flex flex-col gap-3 p-3 border rounded-xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Advice</h3>
                <div className="flex items-center">
                    <SectionMemoryButton section="advice" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-11 text-xs font-bold text-emerald-600 hover:bg-emerald-100/50 sm:h-7"
                        onClick={handleAdd}
                    >
                        <PlusCircle className="size-3 mr-1" /> Add
                    </Button>
                </div>
            </div>

            <MemoryUndoBar section="advice" />

            {/* List */}
            <div className="flex flex-col gap-2">
                {value.length === 0 && (
                    <div className="text-xs text-slate-400">No advice added yet</div>
                )}

                {value.map((item, index) => {
                    const isEditing = editingIndex === index;

                    return (
                        <div
                            key={index}
                            className="flex items-start gap-2 border rounded-lg p-2 bg-slate-50"
                        >
                            <span className="text-slate-400 mt-1">•</span>

                            {/* The actions sit beside the advice on a desktop and under it on a
                                phone, where a shared row leaves neither enough width. */}
                            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start">
                                <div className="min-w-0 flex-1">
                                    {isEditing ? (
                                        <textarea
                                            value={tempValue}
                                            onChange={(e) => setTempValue(e.target.value)}
                                            className="w-full text-base sm:text-sm border rounded-md p-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                            rows={2}
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-700">{item}</p>
                                    )}
                                </div>

                                <div className="flex shrink-0 justify-end gap-1">
                                    {isEditing ? (
                                        <>
                                            <Button size="sm" className="h-11 text-xs px-4 sm:h-7 sm:px-3" onClick={handleSave}>
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-11 text-xs px-4 text-slate-500 sm:h-7 sm:px-3"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-11 text-xs px-4 text-slate-500 sm:h-7 sm:px-2"
                                                onClick={() => handleEdit(index)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-11 text-xs px-4 text-rose-500 hover:bg-rose-50 hover:text-rose-600 sm:h-7 sm:px-2"
                                                onClick={() => handleDelete(index)}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
