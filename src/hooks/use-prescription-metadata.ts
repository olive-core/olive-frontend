import api from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";


// Define a constant for the query keys to ensure consistency
export const METADATA_KEY = {
    "ALL": "prescription-metadata",
    "MEDICINE": "medicines",
    "CHIEF_COMPLAINT": "chief-complaints",
    "HISTORY": "history",
    "DIAGNOSIS": "diagnosis",
    "INVESTIGATION": "investigations"
}

const fetchList = async (endpoint: string) => {
    const res = await api.get(endpoint);
    return res.data;
}

export const usePrescriptionMetadata = () => {
    const queryClient = useQueryClient();

    // Configuration for static/slow-changing data
    const queryConfig = {
        staleTime: 1000 * 60 * 60, // 1 hour: Data is "fresh" for an hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours: Keep in cache even if unused
        retry: 2,
    };

    // Parallel fetching using multiple useQuery hooks
    // React Query handles the optimization automatically
    // const medicineQuery = useQuery({
    //     queryKey: [METADATA_KEY.ALL, METADATA_KEY.MEDICINE],
    //     queryFn: () => fetchList("/medicine"),
    //     ...queryConfig
    // });

    const chiefComplaintQuery = useQuery({
        queryKey: [METADATA_KEY.ALL, METADATA_KEY.CHIEF_COMPLAINT],
        queryFn: () => fetchList("/chief-complaint-name"),
        ...queryConfig
    });

    const historyQuery = useQuery({
        queryKey: [METADATA_KEY.ALL, METADATA_KEY.HISTORY],
        queryFn: () => fetchList("/history-name"),
        ...queryConfig
    });

    const diagnosisQuery = useQuery({
        queryKey: [METADATA_KEY.ALL, METADATA_KEY.DIAGNOSIS],
        queryFn: () => fetchList("/diagnosis-name"),
        ...queryConfig
    });

    // const investigationQuery = useQuery({
    //     queryKey: [METADATA_KEY.ALL, METADATA_KEY.INVESTIGATION],
    //     queryFn: () => fetchList("/investigations"),
    //     ...queryConfig
    // });

    // Helper to invalidate everything at once
    const invalidate = (key: keyof typeof METADATA_KEY) => {
        if (key === "ALL") {
            queryClient.invalidateQueries({ queryKey: [METADATA_KEY.ALL] });
        } else {
            queryClient.invalidateQueries({ queryKey: [METADATA_KEY.ALL, METADATA_KEY[key]] });
        }
    };

    return {
        // medicine
        // medicineList: {
        //     data: medicineQuery.data ?? [],
        //     isLoading: medicineQuery.isLoading,
        //     isError: medicineQuery.isError,
        // },

        // chief complaint
        chiefComplaintList: {
            data: chiefComplaintQuery.data ?? [],
            isLoading: chiefComplaintQuery.isLoading,
            isError: chiefComplaintQuery.isError,
        },

        // history
        historyList: {
            data: historyQuery.data ?? [],
            isLoading: historyQuery.isLoading,
            isError: historyQuery.isError,
        },

        // diagnosis
        diagnosisList: {
            data: diagnosisQuery.data ?? [],
            isLoading: diagnosisQuery.isLoading,
            isError: diagnosisQuery.isError,
        },

        // investigation
        // investigationList: {
        //     data: investigationQuery.data ?? [],
        //     isLoading: investigationQuery.isLoading,
        //     isError: investigationQuery.isError,
        // },
        invalidateMetadata: invalidate
    };
};