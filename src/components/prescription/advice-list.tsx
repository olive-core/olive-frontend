import { useState } from "react";

interface AdviceListProps {
    value: string[];
    onChange: (val: string[]) => void;
}

export default function AdviceList({ value, onChange }: AdviceListProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempValue, setTempValue] = useState("");

    const handleAdd = () => {
        onChange([...value, ""]);
        setEditingIndex(value.length);
        setTempValue("");
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setTempValue(value[index]);
    };

    const handleSave = () => {
        if (editingIndex === null) return;

        const updated = [...value];
        updated[editingIndex] = tempValue.trim();
        onChange(updated);

        setEditingIndex(null);
        setTempValue("");
    };

    const handleDelete = (index: number) => {
        const updated = value.filter((_, i) => i !== index);
        onChange(updated);
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setTempValue("");
    };

    return (
        <div className="flex flex-col gap-3 p-3 border rounded-xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Advice</h3>
                <button
                    onClick={handleAdd}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                    + Add
                </button>
            </div>

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
                            {/* Bullet */}
                            <span className="text-slate-400 mt-1">•</span>

                            {/* Content */}
                            <div className="flex-1">
                                {isEditing ? (
                                    <textarea
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        className="w-full text-sm border rounded-md p-2 outline-none focus:ring-2 focus:ring-slate-300"
                                        rows={2}
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-sm text-slate-700">{item}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="text-xs px-2 py-1 rounded bg-emerald-500 text-white"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="text-xs px-2 py-1 rounded bg-slate-300"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="text-xs px-2 py-1 rounded bg-slate-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}