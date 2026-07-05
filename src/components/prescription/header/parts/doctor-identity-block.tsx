import { cn } from "@/lib/utils";
import { joinDoctorName } from "@/lib/header-config";
import type { HeaderRenderProps } from "../header-render-props";

interface DoctorIdentityBlockProps extends HeaderRenderProps {
    align?: "left" | "center";
}

// The doctor's name (branded with the accent) plus designation, qualification and BMDC.
// Qualification and BMDC stay neutral slate so they read on any printer.
export default function DoctorIdentityBlock({ identity, config, palette, align = "left" }: DoctorIdentityBlockProps) {
    const name = joinDoctorName(identity);

    return (
        <div className={cn("flex min-w-0 flex-col", align === "center" ? "items-center text-center" : "items-start")}>
            <h2
                className="font-display text-xl font-semibold leading-tight md:text-2xl"
                style={{ color: palette.nameColor }}
            >
                {name || "Doctor name"}
            </h2>
            {config.designation && <p className="text-sm font-medium text-slate-700">{config.designation}</p>}
            {identity.qualification && <p className="text-sm text-slate-500">{identity.qualification}</p>}
            {identity.bmdcNo && (
                <p className="mt-1 text-xs text-slate-600">
                    BMDC Reg: <span className="font-semibold">{identity.bmdcNo}</span>
                </p>
            )}
        </div>
    );
}
