import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { CaseDetail } from '@/types/case';

export function useCase(caseId: string) {
    return useQuery({
        queryKey: ['case-detail', caseId],
        queryFn: () => api.get<CaseDetail>(`/case/detail/${caseId}`).then((response) => response.data),
    });
}
