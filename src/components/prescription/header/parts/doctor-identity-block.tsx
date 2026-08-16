import { cn } from "@/lib/utils";
import { joinDoctorName } from "@/lib/header-config";
import type { HeaderRenderProps } from "../header-render-props";

interface DoctorIdentityBlockProps extends HeaderRenderProps {
    align?: "left" | "center";
}

// The doctor's name (branded with the accent) plus designation, qualification and BMDC.
// Qualification and BMDC stay neutral slate so they read on any printer, at full ink `data-focus` marks
// each field so clicking it in the editor preview jumps to its control; `whitespace-pre-line`
// honours the line breaks doctors type into multi-line fields.
export default function DoctorIdentityBlock({ identity, config, palette, align = "left" }: DoctorIdentityBlockProps) {
    const name = joinDoctorName(identity);

    return (
        <div className={cn("flex min-w-0 flex-col", align === "center" ? "items-center text-center" : "items-start")}>
            <h2
                data-focus="name"
                className="font-display text-[1.35rem] font-semibold leading-tight tracking-tight break-words"
                style={{ color: palette.nameColor }}
            >
                {name || "Doctor name"}
            </h2>
            {config.nameBn.trim() && (
                <p
                    data-focus="nameBn"
                    lang="bn"
                    className="text-[1.05rem] font-medium leading-tight"
                    style={{ color: palette.nameColor }}
                >
                    {config.nameBn}
                </p>
            )}
            {identity.qualification && (
                <p data-focus="qualification" className="whitespace-pre-line text-[13px] leading-snug text-slate-900">
                    {identity.qualification}
                </p>
            )}
            {config.designation && (
                <p data-focus="designation" className="whitespace-pre-line text-[13px] font-medium leading-snug text-slate-900">
                    {config.designation}
                </p>
            )}
            {identity.bmdcNo && (
                <p data-focus="bmdcNo" className="text-[11.5px] leading-snug text-slate-900">
                    BMDC Reg: <span className="font-semibold">{identity.bmdcNo}</span>
                </p>
            )}
        </div>
    );
}
