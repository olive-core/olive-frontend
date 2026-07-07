import type { SearchConfig } from "@/lib/search-core/types";
import type { InvestigationRecord } from "./types";

// A single searchable field (name), matched as a substring so partial recall is wide,
// then re-ranked by the tiered ladder so prefix/word-start matches float to the top.
export const investigationSearchConfig: SearchConfig<InvestigationRecord> = {
    identity: record => record.investigation_name_id,
    fields: [{ value: record => record.name, width: "substring", priority: 0 }],
};
