import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { CakeIcon, PencilIcon, PhoneIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAgeFromDOB } from "@/lib/utils";
import type { PatientInfoType } from "@/types/patient";

const SEX_LABELS: Record<NonNullable<PatientInfoType["sex"]>, string> = {
    male: "Male",
    female: "Female",
    non_binary: "Non-binary",
};

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof PhoneIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Icon className="size-4" />
            </div>
            <div className="leading-tight">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-700">{value}</p>
            </div>
        </div>
    );
}

interface PatientProfileCardProps {
    patient: PatientInfoType;
    phone?: string;
}

export function PatientProfileCard({ patient, phone }: PatientProfileCardProps) {
    const fullName = (patient.name ?? "").trim();
    const initials = fullName.split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase();
    const age = getAgeFromDOB(patient.date_of_birth).years;
    const sexLabel = patient.sex ? SEX_LABELS[patient.sex] : undefined;
    const dateOfBirth = format(new Date(patient.date_of_birth), "d MMM yyyy");

    return (
        <Card>
            <CardContent className="flex flex-col items-center gap-6 text-center">
                <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl font-semibold text-white shadow-sm">
                    {initials || <UserRoundIcon className="size-10" />}
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                        {fullName || "Your profile"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {age} yrs{sexLabel ? ` · ${sexLabel}` : ""}
                    </p>
                </div>

                <Separator />

                <dl className="flex w-full flex-col gap-4 text-left">
                    {phone && <DetailRow icon={PhoneIcon} label="Phone" value={phone} />}
                    <DetailRow icon={CakeIcon} label="Date of birth" value={dateOfBirth} />
                    {sexLabel && <DetailRow icon={UserRoundIcon} label="Sex" value={sexLabel} />}
                </dl>

                <Button asChild variant="outline" className="w-full">
                    <Link to="/patient/profile/edit">
                        <PencilIcon className="size-4" />
                        Edit profile
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
