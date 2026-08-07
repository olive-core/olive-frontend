import { PlusCircle, Trash2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRef, useState } from "react";
import { useCommitOnClickOutside } from "@/hooks/use-commit-on-click-outside";

import type {
    ListInfoFieldName,
    ListInfoType,
    ChiefComplaintType,
    DiagnosisType,
    HistoryType,
    InvestigationType,
} from "@/types/prescription";
import DebouncedSearchSelect from "./debounced-search-select";
import api from "@/lib/axios";
import { useInvestigationSearch } from "@/hooks/use-investigation-search";
import SectionItem, { type SectionItemProps } from "./paper/section-item";
import { SectionMemoryButton } from "@/components/memory/apply-memory-button";
import MemoryUndoBar from "@/components/memory/memory-undo-bar";
import { MEMORY_SECTION_BY_FIELD_NAME } from "@/lib/memory";

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
    const memorySection = MEMORY_SECTION_BY_FIELD_NAME[fieldName];

    const handleAdd = () => {
        addEmptyItem();
        setEditingItemIndex(info.length); // Set to the new item's index
    }

    return (
        <div
            className={`flex flex-col gap-2 p-2 rounded-xl transition-colors duration-300 
            ${isDiagnosis ? "bg-emerald-50/40 border border-emerald-300 pl-3" : ""}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <h3 className={`font-bold text-xs uppercase tracking-widest ${isDiagnosis ? "text-emerald-700" : "text-slate-500"}`}>
                    {title}
                </h3>
                <div className="flex items-center">
                    <SectionMemoryButton section={memorySection} />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-100/50"
                        onClick={handleAdd}
                    >
                        <PlusCircle className="size-3 mr-1" /> Add
                    </Button>
                </div>
            </div>

            <MemoryUndoBar section={memorySection} />

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

    const isEditingThisItem = editingItemIndex === index;
    const cardRef = useRef<HTMLDivElement>(null);

    const setIsEditing = (value: boolean) => {
        if (value) {
            setEditingItemIndex(index);
        } else {
            setEditingItemIndex(null);
        }
    }

    return (
        <div
            ref={cardRef}
            className={`group relative transition-all duration-200 rounded-lg border
                ${isEditingThisItem
                    ? "border-emerald-500 bg-white shadow-lg p-4 z-10"
                    : `py-1 px-2 cursor-pointer ${isDiagnosis
                        ? "bg-white/80 border-emerald-100 hover:border-emerald-300"
                        : "bg-muted hover:bg-accent border-border"
                    }`
                }`}
            onClick={() => !isEditingThisItem && setIsEditing(true)}
        >
            {isEditingThisItem ? (
                <EditingItem
                    item={item}
                    index={index}
                    cardRef={cardRef}
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
    // The editor's own card, so a click anywhere on it (its padding included) is not "outside".
    cardRef: React.RefObject<HTMLDivElement | null>;
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


const EditingItem = ({ item, index, cardRef, setIsEditing, onUpdate, onRemove, editingItemStatus, fieldName }: EditingItemProps) => {
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

    useCommitOnClickOutside(cardRef, handleSave);

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

    // Investigation runs on the client-side local index (instant, offline); the other
    // fields still search server-side.
    const isInvestigation = fieldName === "investigation";
    const { search: searchInvestigations, ready: investigationReady } = useInvestigationSearch();

    const fetchFromServer = async (query: string) => {
        const res = await api.get<{ name: string }[]>(
            `${FETCH_OPTION_ENDPOINTS[fieldName]}?q=${query}`
        )

        return res.data.map(item => ({
            label: item.name,
            value: item.name,
        }))
    }

    const fetchOptions = isInvestigation ? searchInvestigations : fetchFromServer;

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
                        minLength={isInvestigation ? 1 : undefined}
                        debounceTime={isInvestigation ? 120 : undefined}
                        queryKeyBase={isInvestigation ? [`${fieldName}-search`, investigationReady] : `${fieldName}-search`}
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
            <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-50">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-2"
                    onClick={() => {
                        onRemove(index);
                        setIsEditing(false);
                    }}
                >
                    <Trash2 className="size-3.5 mr-1.5" /> Remove
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-bold text-slate-500"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 text-xs font-bold px-4"
                        onClick={handleSave}
                    >
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};

function mapToSectionItemProps(item: ListInfoType, fieldName: ListInfoFieldName): SectionItemProps {
    if (fieldName === "diagnosis") {
        const diagnosis = item as DiagnosisType;
        return {
            name:       diagnosis.name,
            icdCode:    diagnosis.icd_code ?? null,
            confidence: diagnosis.confidence ?? null,
            reasoning:  diagnosis.clinical_reasoning ?? null,
        };
    }

    if (fieldName === "investigation") {
        const investigation = item as InvestigationType;
        return {
            name:      investigation.name,
            reasoning: investigation.notes ?? null,
            priority:  investigation.priority ?? null,
        };
    }

    const standard = item as ChiefComplaintType | HistoryType;
    return {
        name:     standard.name,
        duration: standard.duration ?? null,
        notes:    standard.notes ?? null,
    };
}

const NonEditingItem = ({ item, index, onRemove, fieldName }: { item: ListInfoType; index: number; onRemove: (i: number) => void, fieldName: ListInfoFieldName }) => {
    return (
        <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
                <SectionItem {...mapToSectionItemProps(item, fieldName)} />
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