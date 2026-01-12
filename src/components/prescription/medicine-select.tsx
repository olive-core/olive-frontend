// import { useQuery } from "@tanstack/react-query";
import SearchableSelect from "../shared/searchable-select";
// import api from "@/lib/axios";

const MEDICINES_DUMMY = [
    { value: "paracetamol", label: "Paracetamol" },
    { value: "ibuprofen", label: "Ibuprofen" },
    { value: "amoxicillin", label: "Amoxicillin" },
    { value: "azithromycin", label: "Azithromycin" },
    { value: "omeprazole", label: "Omeprazole" },
    { value: "pantoprazole", label: "Pantoprazole" },
    { value: "cetirizine", label: "Cetirizine" },
    { value: "loratadine", label: "Loratadine" },
    { value: "metformin", label: "Metformin" },
    { value: "atorvastatin", label: "Atorvastatin" },
]

export default function MedicineSelect() {

    // const { data: medicineList, isLoading, isError } = useQuery({
    //     queryKey: ["medicine-list"],
    //     queryFn: async () => {
    //         const response = await api.get("/medicine");
    //         return response.data;
    //     }
    // })

    return (
        <SearchableSelect
            options={MEDICINES_DUMMY}
            type="medicine"
        />
    )
}