import { CheckIcon, SoupIcon, XIcon } from "lucide-react";
import MedicineSelect from "./medicine-select";
import DosageSelect from "./dosage-select";

export default function Medicine() {


    return (
        <div className="pt-2">
            <h3 className="font-semibold text-md text-emerald-600 mb-2">Medicine (Rx)</h3>

            <div className="">
                <div className="flex gap-2 items-center">
                    <MedicineSelect />
                    <DosageSelect />
                </div>
                <div className="flex items-center gap-4">
                    <div className="border rounded-md flex items-center">
                        <div className="p-2 bg-emerald-50 overflow-hidden rounded-l-md">
                            <CheckIcon className="size-4 text-emerald-600" />
                        </div>
                        <div className="p-2">
                            <SoupIcon className="size-4 text-slate-500" />
                        </div>
                        <div className="p-2 bg-slate-50 overflow-hidden rounded-r-md">
                            <XIcon className="size-4 text-slate-600/50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}