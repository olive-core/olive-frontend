export type MedicineRecord = {
    medicine_id: string;
    trade_name?: string | null;
    generic_name_strength?: string | null;
    dosage_form?: string | null;
    medicine_company?: string | null;
};

export type MedicineSnapshot = {
    version: string;
    medicines: MedicineRecord[];
};

// A record with its normalized matching fields precomputed once at index build time.
export type IndexedMedicine = {
    record: MedicineRecord;
    tradeNorm: string;
    tradeKey: string;
    genericNorm: string;
    genericKey: string;
};

export type SearchResult = {
    item: IndexedMedicine;
    tier: number;
    distance: number;
    // True when the brand (trade) field produced the tier. Brand matches win ties,
    // because Bangladesh doctors prescribe by brand name.
    matchedBrand: boolean;
};
