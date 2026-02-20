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

interface MedicineSelectProps {
    value?: string,
    setValue: (value: string) => void,
}

export default function MedicineSelect({ value, setValue }: MedicineSelectProps) {



    return (
        <SearchableSelect
            options={MEDICINES_DUMMY}
            type="medicine"
            value={value}
            setValue={setValue}
        />
    )
}