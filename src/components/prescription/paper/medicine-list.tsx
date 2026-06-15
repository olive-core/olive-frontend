import MedicineCard, { type MedicineCardProps } from "./medicine-card";

interface MedicineListProps {
    medicines: MedicineCardProps[];
}

export default function MedicineList({ medicines }: MedicineListProps) {
    if (medicines.length === 0) return null;

    return (
        <div className="mb-4">
            <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base text-emerald-600">Medicine (Rx)</h3>
                </div>
                <div className="flex flex-col gap-2">
                    {medicines.map((medicine, index) => (
                        <MedicineCard key={index} {...medicine} />
                    ))}
                </div>
            </div>
        </div>
    );
}
