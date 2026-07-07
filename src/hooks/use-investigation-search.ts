import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import type { Option } from "@/components/prescription/debounced-search-select";
import {
    ensureInvestigationIndex,
    isInvestigationIndexReady,
    searchInvestigationIndex,
} from "@/lib/investigation-search/index-store";
import type { InvestigationRecord } from "@/lib/investigation-search/types";

const RESULT_LIMIT = 200;
const SERVER_MIN_QUERY_LENGTH = 2;

function toOption(record: InvestigationRecord): Option {
    return { label: record.name, value: record.name };
}

async function searchOnServer(query: string): Promise<Option[]> {
    if (query.trim().length < SERVER_MIN_QUERY_LENGTH) return [];
    const res = await api.get<InvestigationRecord[]>(
        `/investigation-name/search?q=${encodeURIComponent(query)}`,
    );
    return res.data.map(toOption);
}

// Searches the local index once it is ready; until then (a user's very first
// visit) it transparently falls back to the server endpoint.
export function useInvestigationSearch() {
    const [ready, setReady] = useState(isInvestigationIndexReady());

    useEffect(() => {
        let active = true;
        ensureInvestigationIndex()
            .catch(() => undefined)
            .finally(() => {
                if (active) setReady(isInvestigationIndexReady());
            });
        return () => {
            active = false;
        };
    }, []);

    const search = useCallback(async (query: string): Promise<Option[]> => {
        if (isInvestigationIndexReady()) {
            return searchInvestigationIndex(query, RESULT_LIMIT).map(hit => toOption(hit.record));
        }
        return searchOnServer(query);
    }, []);

    return { search, ready };
}
