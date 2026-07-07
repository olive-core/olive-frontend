import { createSearchIndex } from "@/lib/search-core/index-store";
import { createSnapshotCache } from "@/lib/search-core/snapshot-cache";
import { medicineSearchConfig } from "./config";
import type { MedicineRecord, MedicineSnapshot } from "./types";

const cache = createSnapshotCache<MedicineRecord>({
    dbName: "olive-medicine",
    versionUrl: "/medicine/snapshot/version",
    snapshotUrl: "/medicine/snapshot",
    extractRecords: payload => (payload as MedicineSnapshot).medicines,
});

const medicineIndex = createSearchIndex({ cache, config: medicineSearchConfig });

export const ensureMedicineIndex = medicineIndex.ensureReady;
export const isMedicineIndexReady = medicineIndex.isReady;
export const searchMedicineIndex = medicineIndex.search;
