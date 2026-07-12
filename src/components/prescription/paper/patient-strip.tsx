import { format } from "date-fns";

const SEX_LABELS: Record<string, string> = {
    male: "Male",
    female: "Female",
    non_binary: "Non-binary",
};

interface PatientStripProps {
    name?:         string | null;
    dateOfBirth?:  string | null;
    sex?:          string | null;
    dateTime:      string | Date;
}

function calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();

    const yearsDifference = today.getFullYear() - birth.getFullYear();
    const monthsBehind = today.getMonth() - birth.getMonth();
    const isBeforeBirthdayThisYear =
        monthsBehind < 0 || (monthsBehind === 0 && today.getDate() < birth.getDate());

    return isBeforeBirthdayThisYear ? yearsDifference - 1 : yearsDifference;
}

export default function PatientStrip({ name, dateOfBirth, sex, dateTime }: PatientStripProps) {
    const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;

    return (
        <div className="border-y py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mt-5">
            <div className="flex gap-4">
                <p className="text-slate-500">
                    Name: <span className="font-semibold">{(name ?? "").trim()}</span>
                </p>

                {dateOfBirth && (
                    <p className="text-slate-500">
                        Age: <span className="font-semibold">{calculateAge(dateOfBirth)}y</span>
                    </p>
                )}

                {sex && (
                    <p className="text-slate-500">
                        Sex: <span className="font-semibold">{SEX_LABELS[sex] ?? sex}</span>
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                <p className="text-slate-500">
                    Date: <span className="font-semibold">{format(date, "MMM dd, yyyy")}</span>
                </p>
                <p className="text-slate-500">
                    <span className="font-semibold">{format(date, "hh:mm a")}</span>
                </p>
            </div>
        </div>
    );
}
