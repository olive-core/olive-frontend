import DoctorInfo from "./doctor-info";
import PatientInfo from "./patient-info";
import VitalsBar from "./paper/vitals-bar";
import FollowUpBlock from "./paper/follow-up-block";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { vitalsFromOnExaminations } from "@/lib/vitals";
import { useParams } from "@tanstack/react-router";

const getRoutineString = (routine: any) => {
    if (routine.gap_hour) return `Every ${routine.gap_hour} hours`;

    let m = 0, n = 0, e = 0;
    
    if (routine.before_breakfast || routine.after_breakfast) m = 1;
    if (routine.before_lunch || routine.after_lunch) n = 1;
    if (routine.before_dinner || routine.after_dinner) e = 1;

    return `${m}+${n}+${e}`;
};

export const PrescriptionView = () => {
    const { consultationId } = useParams({ from: '/doctor/prescribe/$consultationId' });
    const getSubmitPayload = usePrescriptionStore(s => s.getSubmitPayload);
    const data = getSubmitPayload(consultationId);

    const vitals = vitalsFromOnExaminations(data.on_examinations);
    const followUp = { follow_up_days: data.follow_up_days ?? null, follow_up_notes: data.follow_up_notes ?? null };

    return (
        <div className="bg-white text-sm">
            {/* A4 Container (no fixed height → allows pagination) */}
            <div className="w-[210mm] mx-auto p-6 border print:border-none">

                <DoctorInfo hideActions={true} />
                <PatientInfo sessionId={consultationId} />

                <VitalsBar vitals={vitals} />

                {/* dashed separator */}
                <div className="border-t border-dashed my-3" />

                <div className="grid grid-cols-3 gap-4">

                    {/* LEFT */}
                    <div className="space-y-3">
                        <Section title="Chief Complaint">
                            {data.chief_complaints.map((cc: any, i: number) => (
                                <li key={i}>{cc.name_text}</li>
                            ))}
                        </Section>
                                    
                        <Section title="History">
                            {data.histories.map((h: any, i: number) => (
                                <li key={i}>{h.name_text}</li>
                            ))}
                        </Section>
                                    
                        <Section title="Diagnosis">
                            {data.diagnoses.map((d: any, i: number) => (
                                <li key={i}>{d.name_text}</li>
                            ))}
                        </Section>
                                    
                        <Section title="Investigation">
                            {data.investigations.map((i: any, idx: number) => (
                                <li key={idx}>{i.name_text}</li>
                            ))}
                        </Section>
                    </div>

                    {/* RIGHT (MEDICINE) */}
                    <div className="col-span-2">
                        <h3 className="font-semibold text-emerald-600 mb-2">Rx</h3>

                        <div className="space-y-2">
                            {data.rx_list.map((m: any, i: number) => (
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
                        {data.advice_list.map((a: string, i: number) => (
                            <li key={i} className="break-inside-avoid">
                                {a}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4">
                    <FollowUpBlock value={followUp} />
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