import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { ListInfoType } from "@/types/prescription";
import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { Input } from "../ui/input";

interface ListInfoProps {
    title: string;
    info: ListInfoType[];
    fieldName: "chief-complaint" | "history" | "diagnosis" | "investigation";
}

export default function ListInfo({ title, info, fieldName }: ListInfoProps) {
    return (
        <div>
            <div className="flex items-center mb-1 gap-2">
                <h3 className="font-semibold text-md text-emerald-600">{title}</h3>
            </div>

            <ul className="ml-8 list-disc">
                {info.map((item, index) => (
                    <InfoItem
                        key={index}
                        item={item}
                        fieldName={fieldName}
                    />
                ))}
            </ul>
        </div>
    );
}

const InfoItem = ({
    item,
    fieldName,
}: {
    item: ListInfoType;
    fieldName: ListInfoProps["fieldName"];
}) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div
            className="flex gap-2 items-start justify-between px-6 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 mb-2 mr-3 relative group"
            onClick={() => !isEditing && setIsEditing(true)}
        >
            {isEditing ? (
                <EditingItem
                    item={item}
                    fieldName={fieldName}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                />
            ) : (
                <NonEditingItem item={item} />
            )}

            {!isEditing && (
                <Button
                    size="icon-sm"
                    variant="ghost"
                    className="absolute top-2 right-2 rounded-md group-hover:bg-rose-200 group-hover:text-rose-500"
                >
                    <XIcon />
                </Button>
            )}
        </div>
    );
};

interface ItemProps {
    item: ListInfoType;
    fieldName: ListInfoProps["fieldName"];
    isEditing: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
}

const EditingItem = ({ item, setIsEditing }: ItemProps) => {
    const [editingItem, setEditingItem] = useState(item);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditingItem((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    };

    return (
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 mb-2">
                <Input
                    className="text-slate-700"
                    value={editingItem.name}
                    onChange={handleChange}
                    placeholder="Name"
                />

                {"duration" in editingItem && (
                    <Input
                        className="ml-2 text-sm italic text-slate-500"
                        value={editingItem.duration ?? ""}
                        placeholder="Duration"
                        onChange={(e) =>
                            setEditingItem((prev) => ({
                                ...prev,
                                duration: e.target.value,
                            }))
                        }
                    />
                )}
            </div>

            {"notes" in editingItem && (
                <Input
                    className="text-sm text-slate-600"
                    value={editingItem.notes ?? ""}
                    placeholder="Notes"
                    onChange={(e) =>
                        setEditingItem((prev) => ({
                            ...prev,
                            notes: e.target.value,
                        }))
                    }
                />
            )}

            <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => setIsEditing(false)}>
                    Save
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

const NonEditingItem = ({ item }: { item: ListInfoType }) => {
    const hasDuration = "duration" in item && item.duration;
    const hasNotes = "notes" in item && item.notes;

    return (
        <div>
            <span className="text-slate-700">{item.name}</span>

            {hasDuration && (
                <span className="ml-2 text-sm italic text-slate-500">
                    {item.duration}
                </span>
            )}

            {hasNotes && (
                <p className="text-sm text-slate-600">{item.notes}</p>
            )}
        </div>
    );
};
