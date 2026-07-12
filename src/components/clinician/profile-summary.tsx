import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IdCardIcon, PhoneIcon } from "lucide-react";

interface ProfileSummaryProps {
    name?: string;
    qualification?: string;
    specializations?: string[] | null;
    bmdcNo?: string;
    phone?: string;
}

// Read-only identity panel: who the doctor is, at a glance, beside the editable form.
export function ProfileSummary({
    name,
    qualification,
    specializations,
    bmdcNo,
    phone,
}: ProfileSummaryProps) {
    const tags = specializations ?? [];
    const fullName = (name ?? "").trim();
    const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    return (
        <Card className="md:sticky md:top-24">
            <CardContent className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold uppercase text-emerald-700">
                    {initials || "Dr"}
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {fullName ? `Dr. ${fullName}` : "Your profile"}
                    </h2>
                    {qualification && (
                        <p className="mt-0.5 text-sm text-slate-500">{qualification}</p>
                    )}
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {tags.map((s) => (
                            <span
                                key={s}
                                className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                {(phone || bmdcNo) && (
                    <>
                        <Separator />
                        <dl className="w-full space-y-2.5 text-left">
                            {phone && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <PhoneIcon className="size-4 shrink-0 text-slate-400" />
                                    <span className="text-slate-600">{phone}</span>
                                </div>
                            )}
                            {bmdcNo && (
                                <div className="flex items-center gap-2.5 text-sm">
                                    <IdCardIcon className="size-4 shrink-0 text-slate-400" />
                                    <span className="text-slate-600">BMDC {bmdcNo}</span>
                                </div>
                            )}
                        </dl>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
