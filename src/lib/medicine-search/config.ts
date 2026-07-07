import type { SearchConfig } from "@/lib/search-core/types";
import { genericLabel, type MedicineRecord } from "./types";

// Brand = prefix (precision); generic = substring (recall). Brand has the lower
// priority so it wins ties — Bangladesh doctors prescribe by brand name.
export const medicineSearchConfig: SearchConfig<MedicineRecord> = {
    identity: record => record.medicine_id,
    fields: [
        { value: record => record.trade_name ?? "", width: "prefix", priority: 0 },
        { value: record => genericLabel(record), width: "substring", priority: 1 },
    ],
};
