import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { memorySectionApiKey, type MemoryBody, type MemorySectionKey } from "@/lib/memory";

export interface MemorySummary {
    template_id:   string;
    template_name: string;
    /** API section keys the memory fills — derived from its contents on every read. */
    sections:      string[];
    use_count:     number;
    is_pinned:     boolean;
    last_used_at:  string | null;
    created_at:    string;
    updated_at:    string;
}

interface MemoryDetail {
    template_id:       string;
    template_name:     string;
    prescription_data: MemoryBody;
}

const MEMORY_LIBRARY_KEY = "memory-library";

// Ranking and content search both live in the database, so the picker stays instant
// however large a doctor's library grows. `isEnabled` keeps the seven section pickers on a
// prescription screen from each fetching a library nobody has opened yet.
export function useMemoryLibrary(query: string, section?: MemorySectionKey, isEnabled = true) {
    const { userId } = useAuthStore();
    const sectionKey = section && memorySectionApiKey(section);

    return useQuery<MemorySummary[]>({
        queryKey: [MEMORY_LIBRARY_KEY, userId, query, sectionKey ?? null],
        queryFn: async () => {
            const response = await api.get("/prescription-template/my", {
                params: { clinician_id: userId, q: query || undefined, section: sectionKey },
            });
            return response.data;
        },
        enabled: isEnabled && !!userId,
        placeholderData: (previous) => previous,
    });
}

/** Applies a memory onto the prescription being written, and records the use that ranks it. */
export function useApplyMemory(section?: MemorySectionKey) {
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();
    const applyMemory = usePrescriptionStore((state) => state.applyMemory);

    return useMutation({
        mutationFn: async (memory: MemorySummary) => {
            const response = await api.get<MemoryDetail>(`/prescription-template/${memory.template_id}`);
            applyMemory(memory.template_name, response.data.prescription_data, section && [section]);
            // Ranking is a convenience — a use that fails to record must not fail the apply.
            await api
                .post(`/prescription-template/${memory.template_id}/use?clinician_id=${userId}`)
                .catch(() => undefined);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [MEMORY_LIBRARY_KEY] }),
    });
}

export function useDeleteMemory() {
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (memory: MemorySummary) => {
            await api.delete(`/prescription-template/${memory.template_id}?clinician_id=${userId}`);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [MEMORY_LIBRARY_KEY] }),
    });
}

export function useToggleMemoryPin() {
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (memory: MemorySummary) => {
            await api.put(`/prescription-template/${memory.template_id}?clinician_id=${userId}`, {
                is_pinned: !memory.is_pinned,
            });
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: [MEMORY_LIBRARY_KEY] }),
    });
}
