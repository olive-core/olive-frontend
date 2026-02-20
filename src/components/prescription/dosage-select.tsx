import SearchableSelect from "../shared/searchable-select"

const DOSAGE_DUMMY = [
    { value: "40_mg", label: "40 mg" },
    { value: "50_mg", label: "50 mg" },
    { value: "60_mg", label: "60 mg" },
    { value: "70_mg", label: "70 mg" },

]

interface DosageSelectProps {
    value?: string,
    setValue: (value: string) => void,
}

export default function DosageSelect({ value, setValue }: DosageSelectProps) {
    return (
        <SearchableSelect
            options={DOSAGE_DUMMY}
            type="Dosage"
            value={value}
            setValue={setValue}
        />
    )
}