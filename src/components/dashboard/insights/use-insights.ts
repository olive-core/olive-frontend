import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
    ComplaintDiagnosisInsight,
    ComplaintsInsight,
    EarlyReturnsInsight,
    FollowUpInsight,
    InsightFilterOptions,
    OverdueFollowUp,
    OverviewInsight,
    ProtocolInsight,
    TrendsInsight,
} from "@/types/insights";
import { toQueryParams, type InsightFilters } from "./filters/insight-filters";

function useInsight<T>(screen: string, filters: InsightFilters, enabled = true) {
    const params = toQueryParams(filters);
    return useQuery<T>({
        queryKey: ["insights", screen, params],
        queryFn:  async () => (await api.get<T>(`/insights/${screen}`, { params })).data,
        enabled,
    });
}

export const useOverview           = (filters: InsightFilters) => useInsight<OverviewInsight>("overview", filters);
export const useTopComplaints      = (filters: InsightFilters) => useInsight<ComplaintsInsight>("complaints", filters);
export const useComplaintDiagnosis = (filters: InsightFilters) => useInsight<ComplaintDiagnosisInsight>("complaint-diagnosis", filters);
export const useFollowUp           = (filters: InsightFilters) => useInsight<FollowUpInsight>("follow-up", filters);
export const useEarlyReturns       = (filters: InsightFilters) => useInsight<EarlyReturnsInsight>("early-returns", filters);
export const useTrends             = (filters: InsightFilters) => useInsight<TrendsInsight>("trends", filters);

/** Only ever asked for once the doctor has picked a diagnosis to look at. */
export const useProtocol = (filters: InsightFilters) =>
    useInsight<ProtocolInsight>("protocol", filters, Boolean(filters.diagnosis));

/** Only fetched when the doctor opens the list of people to call. */
export const useOverdueFollowUps = (filters: InsightFilters, enabled: boolean) =>
    useInsight<OverdueFollowUp[]>("follow-up/overdue", filters, enabled);

/** Unfiltered on purpose: the pickers must not shrink as the doctor narrows. */
export function useFilterOptions() {
    return useQuery<InsightFilterOptions>({
        queryKey: ["insights", "filter-options"],
        queryFn:  async () => (await api.get<InsightFilterOptions>("/insights/filter-options")).data,
        staleTime: 5 * 60 * 1000,
    });
}
