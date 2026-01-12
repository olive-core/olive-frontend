import SearchableSelect from "../shared/searchable-select"

const DOSAGE_DUMMY = [
    { value: "40_mg", label: "40 mg" },
    { value: "50_mg", label: "50 mg" },
    { value: "60_mg", label: "60 mg" },
    { value: "70_mg", label: "70 mg" },

]

export default function DosageSelect() {
    return (
        <SearchableSelect
            options={DOSAGE_DUMMY}
            type="Dosage"
        />
    )
}