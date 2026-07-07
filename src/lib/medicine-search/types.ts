export type MedicineRecord = {
    medicine_id: string;
    trade_name?: string | null;
    // Backend splits the generic into name + strength; older cached snapshots may still
    // carry the composed `generic_name_strength`, so keep it as a fallback.
    generic_name?: string | null;
    strength?: string | null;
    generic_name_strength?: string | null;
    dosage_form?: string | null;
    medicine_company?: string | null;
};

// The generic label shown to doctors: "Paracetamol 500 mg". Composed from the split
// columns, falling back to the legacy composed field for snapshots cached pre-split.
export function genericLabel(record: MedicineRecord): string {
    const composed = [record.generic_name, record.strength].filter(Boolean).join(" ");
    return composed || (record.generic_name_strength ?? "");
}

export type MedicineSnapshot = {
    version: string;
    medicines: MedicineRecord[];
};
