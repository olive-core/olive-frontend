import { format } from "date-fns";

export default function PatientInfo() {
    return (
        <div className="border-y py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mt-5">
            <div className="flex gap-4">
                <p className="text-slate-500">
                    Name: <span className="font-semibold">Patient Name</span>
                </p>

                <p className="text-slate-500">
                    Age: <span className="font-semibold">24y</span>
                </p>

                <p className="text-slate-500">
                    Sex: <span className="font-semibold">Male</span>
                </p>
            </div>

            <div className="flex gap-2">
                <p className="text-slate-500">
                    Date: <span className="font-semibold">{format(new Date(), "MMM dd. yyyy")}</span>
                </p>

                <p className="text-slate-500">
                    <span className="font-semibold">
                        {format(new Date(), "hh:mm a")}
                    </span>
                </p>
            </div>

        </div>
    )
}