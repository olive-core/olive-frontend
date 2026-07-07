import { createSearchIndex } from "@/lib/search-core/index-store";
import { createSnapshotCache } from "@/lib/search-core/snapshot-cache";
import { investigationSearchConfig } from "./config";
import type { InvestigationRecord, InvestigationSnapshot } from "./types";

const cache = createSnapshotCache<InvestigationRecord>({
    dbName: "olive-investigation",
    versionUrl: "/investigation-name/snapshot/version",
    snapshotUrl: "/investigation-name/snapshot",
    extractRecords: payload => (payload as InvestigationSnapshot).investigation_names,
});

const investigationIndex = createSearchIndex({ cache, config: investigationSearchConfig });

export const ensureInvestigationIndex = investigationIndex.ensureReady;
export const isInvestigationIndexReady = investigationIndex.isReady;
export const searchInvestigationIndex = investigationIndex.search;
