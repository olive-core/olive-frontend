import { DUMMY_PRESCRIPTION } from "@/lib/dummy-data";
import DoctorInfo from "./doctor-info";
import PatientInfo from "./patient-info";

const getRoutineString = (routine: any) => {

    if (routine.gap_hours) return `Every ${routine.gap_hours} hours`;

    if (!routine?.meal_times?.length) return "";

    let m = 0, n = 0, e = 0;

    routine.meal_times.forEach((t: string) => {
        if (t.includes("breakfast") || t.includes("morning")) m = 1;
        if (t.includes("lunch") || t.includes("noon")) n = 1;
        if (t.includes("dinner") || t.includes("night")) e = 1;
    });

    return `${m}+${n}+${e}`;
};

export const PrescriptionView = () => {
    const data = DUMMY_PRESCRIPTION;

    return (
        <div className="bg-white text-sm">
            {/* A4 Container (no fixed height → allows pagination) */}
            <div className="w-[210mm] mx-auto p-6 border print:border-none">

                <DoctorInfo />
                <PatientInfo sessionId="" />

                {/* dashed separator */}
                <div className="border-t border-dashed my-3" />

                <div className="grid grid-cols-3 gap-4">

                    {/* LEFT */}
                    <div className="space-y-3">
                        <Section title="Chief Complaint">
                            {data.chief_complaints.map((cc, i) => (
                                <li key={i}>{cc.complaint_name}</li>
                            ))}
                        </Section>

                        <Section title="History">
                            {data.history.map((h, i) => (
                                <li key={i}>{h.history_name}</li>
                            ))}
                        </Section>

                        <Section title="Diagnosis">
                            {data.diagnoses.map((d, i) => (
                                <li key={i}>{d.diagnosis_name}</li>
                            ))}
                        </Section>

                        <Section title="Investigation">
                            {data.investigations.map((i, idx) => (
                                <li key={idx}>{i.investigation_name}</li>
                            ))}
                        </Section>
                    </div>

                    {/* RIGHT (MEDICINE) */}
                    <div className="col-span-2">
                        <h3 className="font-semibold text-emerald-600 mb-2">Rx</h3>

                        <div className="space-y-2">
                            {data.medicines.map((m, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-start border-b border-dashed pb-2 break-inside-avoid"
                                >
                                    {/* LEFT */}
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {i + 1}. {m.trade_name}
                                            <span className="text-gray-500 text-xs ml-1">
                                                ({m.generic_name})
                                            </span>
                                        </p>

                                        <p className="text-xs text-gray-700">
                                            {m.dosage}
                                        </p>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="text-right">
                                        <p className="font-mono text-base tracking-wider font-semibold">
                                            {getRoutineString(m.routine)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {m.duration}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Advice */}
                <div className="border-t border-dashed my-4" />

                <div>
                    <h3 className="font-semibold text-emerald-600 mb-1">Advice</h3>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                        {data.advice.map((a, i) => (
                            <li key={i} className="break-inside-avoid">
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }: any) => (
    <div>
        <h3 className="font-semibold text-emerald-600">{title}</h3>
        <ul className="list-disc pl-4 text-xs">{children}</ul>
    </div>
);