interface ClinicianHeaderProps {
    name?:         string | null;
    qualification?: string | null;
    bmdcNo?:       string | null;
}

export default function ClinicianHeader({ name, qualification, bmdcNo }: ClinicianHeaderProps) {
    return (
        <div className="pt-2">
            <h3 className="text-xl text-emerald-600 font-display">{(name ?? "").trim()}</h3>
            {qualification && <p className="text-sm text-slate-500">{qualification}</p>}
            {bmdcNo && (
                <p className="mt-2 text-slate-600">
                    BMDC: <span className="font-semibold">{bmdcNo}</span>
                </p>
            )}
        </div>
    );
}
