import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const fetchChiefComplaints = async () => {
    const res = await api.get('chief-complaint');
    return res.data;
}

const fetchHistory = async () => {
    const res = await api.get('history');
    return res.data;
}

const fetchDiagnosis = async () => {
    const res = await api.get('diagnosis');
    return res.data;
}

// NOT AVAILABLE IN CURRENT API
// const fetchInvestigation = async () => {
//     const res = await api.get('investigation');
//     return res.data;
// }

const fetchMedicines = async () => {
    const res = await api.get('medicine');
    return res.data;
}

const queryOptions = {
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24 hour
}

export const useSuggestionList = () => {
    const { data: chiefComplaints, isLoading: isLoadingChiefComplaints } = useQuery({
        queryKey: ['chief-complaints'],
        queryFn: fetchChiefComplaints,
        ...queryOptions
    });

    const { data: history, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['history'],
        queryFn: fetchHistory,
        ...queryOptions
    });

    const { data: diagnosis, isLoading: isLoadingDiagnosis } = useQuery({
        queryKey: ['diagnosis'],
        queryFn: fetchDiagnosis,
        ...queryOptions
    });

    // UNCOMMENT WHEN API AVAILABLE
    // const { data: investigation, isLoading: isLoadingInvestigation } = useQuery({
    //     queryKey: ['investigation'],
    //     queryFn: fetchInvestigation,
    //     ...queryOptions
    // });

    const { data: medicines, isLoading: isLoadingMedicines } = useQuery({
        queryKey: ['medicines'],
        queryFn: fetchMedicines,
        ...queryOptions
    });

    return {
        chiefComplaints,
        isLoadingChiefComplaints,
        history,
        isLoadingHistory,
        diagnosis,
        isLoadingDiagnosis,
        // investigation,
        // isLoadingInvestigation,
        medicines,
        isLoadingMedicines,
    }

}