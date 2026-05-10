import { PillIcon } from "lucide-react";
import Section from "./section";
import type { RxItem } from "@/types/patient";
import { formatMedicineRoutine } from "./medicine-routine";

interface MedicinesSectionProps {
    medicines: RxItem[];
}

export default function MedicinesSection({ medicines }: MedicinesSectionProps) {
    if (medicines.length === 0) return null;

    return (
        <Section icon={<PillIcon className="size-4" />} title="Medicines">
            <ul className="space-y-3">
                {medicines.map((medicine, index) => (
                    <li key={index} className="text-sm">
                        <p className="font-medium text-slate-700">{medicine.trade_name}</p>
                        {medicine.generic_name && medicine.generic_name !== medicine.trade_name && (
                            <p className="text-xs text-slate-400">{medicine.generic_name}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">{formatMedicineRoutine(medicine)}</p>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
