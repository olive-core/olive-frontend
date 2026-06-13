import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getAgeFromDOB } from "@/lib/utils";
import type { PatientInfoType } from "@/types/patient";
import { Skeleton } from "@/components/ui/skeleton";

const SEX_LABEL: Record<NonNullable<PatientInfoType["sex"]>, string> = {
    male: "Male",
    female: "Female",
    non_binary: "Non-binary",
};

// Quiet "who am I treating" anchor for the consultation screen — a premium touch and a safety
// cue that the doctor is on the right record. Shares the 'patient-info' query cache.
export default function PatientChip({ userId }: { userId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ["patient-info", userId],
        queryFn: async () => {
            const response = await api.get<PatientInfoType>(`/patient/${userId}`);
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const fullName = `${data.first_name} ${data.last_name}`.trim();
    const initials = `${data.first_name?.[0] ?? ""}${data.last_name?.[0] ?? ""}`;
    const age = getAgeFromDOB(data.date_of_birth).years;
    const sexLabel = data.sex ? SEX_LABEL[data.sex] : undefined;

    return (
        <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold uppercase text-emerald-700">
                {initials}
            </div>
            <div className="leading-tight">
                <p className="font-medium text-slate-800">{fullName}</p>
                <p className="text-xs text-slate-500">
                    {age} yrs{sexLabel ? ` · ${sexLabel}` : ""}
                </p>
            </div>
        </div>
    );
}
