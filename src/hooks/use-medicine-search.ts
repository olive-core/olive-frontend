import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import type { Option } from "@/components/prescription/debounced-search-select";
import {
    ensureMedicineIndex,
    isMedicineIndexReady,
    searchMedicineIndex,
} from "@/lib/medicine-search/index-store";
import { genericLabel } from "@/lib/medicine-search/types";
import type { MedicineRecord } from "@/lib/medicine-search/types";

const RESULT_LIMIT = 200;
const SERVER_MIN_QUERY_LENGTH = 2;

function toOption(record: MedicineRecord): Option {
    const generic = genericLabel(record);
    const label = record.trade_name ?? generic;
    return {
        label,
        value: label,
        trade_name: record.trade_name ?? undefined,
        // Composed "generic + strength" for display continuity in the prescription.
        generic_name: generic || undefined,
        dosage_form: record.dosage_form ?? undefined,
    };
}

async function searchOnServer(query: string): Promise<Option[]> {
    if (query.trim().length < SERVER_MIN_QUERY_LENGTH) return [];
    const res = await api.get<MedicineRecord[]>(
        `/medicine/search?q=${encodeURIComponent(query)}&search_in=both`,
    );
    return res.data.map(toOption);
}

// Searches the local index once it is ready; until then (a user's very first
// visit) it transparently falls back to the server endpoint.
export function useMedicineSearch() {
    const [ready, setReady] = useState(isMedicineIndexReady());

    useEffect(() => {
        let active = true;
        ensureMedicineIndex()
            .catch(() => undefined)
            .finally(() => {
                if (active) setReady(isMedicineIndexReady());
            });
        return () => {
            active = false;
        };
    }, []);

    const search = useCallback(async (query: string): Promise<Option[]> => {
        if (isMedicineIndexReady()) {
            return searchMedicineIndex(query, RESULT_LIMIT).map(result => toOption(result.item.record));
        }
        return searchOnServer(query);
    }, []);

    return { search, ready };
}
