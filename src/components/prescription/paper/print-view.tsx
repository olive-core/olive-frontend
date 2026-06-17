import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";
import type { ClinicianProfile } from "./read-view";
import ClinicianHeader from "./clinician-header";
import PatientStrip from "./patient-strip";
import VitalsBar from "./vitals-bar";
import FollowUpBlock from "./follow-up-block";
import { vitalsFromOnExaminations } from "@/lib/vitals";
import { formatStoredDuration, formatStoredFrequency } from "@/lib/rx-format";
import { categoryLabel } from "@/lib/dosage-form";

interface PrescriptionPrintViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="font-semibold text-emerald-600">{title}</h3>
            <ul className="list-disc pl-4 text-xs">{children}</ul>
        </div>
    );
}

export default function PrescriptionPrintView({ consultation, clinician, patient }: PrescriptionPrintViewProps) {
    const data = consultation.prescription_data ?? {};
    const vitals = vitalsFromOnExaminations(data.on_examinations);
    const followUp = { follow_up_days: data.follow_up_days ?? null, follow_up_notes: data.follow_up_notes ?? null };

    return (
        <div className="bg-white text-sm">
            <div className="w-[210mm] mx-auto p-6 border print:border-none">

                <ClinicianHeader
                    firstName={clinician?.first_name ?? consultation.clinician_first_name}
                    lastName={clinician?.last_name ?? consultation.clinician_last_name}
                    qualification={clinician?.qualification}
                    bmdcNo={clinician?.bmdc_no}
                />

                <PatientStrip
                    firstName={consultation.patient_first_name}
                    lastName={consultation.patient_last_name}
                    dateOfBirth={patient?.date_of_birth}
                    sex={patient?.sex}
                    dateTime={consultation.created_at}
                />

                <VitalsBar vitals={vitals} />

                <div className="border-t border-dashed my-3" />

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-3">
                        <PrintSection title="Chief Complaints">
                            {(data.chief_complaints ?? []).map((cc: any, i: number) => (
                                <li key={i}>{cc.name_text}</li>
                            ))}
                        </PrintSection>

                        <PrintSection title="History">
                            {(data.histories ?? []).map((h: any, i: number) => (
                                <li key={i}>{h.name_text}</li>
                            ))}
                        </PrintSection>

                        <PrintSection title="Diagnosis">
                            {(data.diagnoses ?? []).map((d: any, i: number) => (
                                <li key={i}>{d.name_text}</li>
                            ))}
                        </PrintSection>

                        <PrintSection title="Investigation">
                            {(data.investigations ?? []).map((inv: any, i: number) => (
                                <li key={i}>{inv.name_text}</li>
                            ))}
                        </PrintSection>
                    </div>

                    <div className="col-span-2">
                        <h3 className="font-semibold text-emerald-600 mb-2">Rx</h3>
                        <div className="space-y-2">
                            {(data.rx_list ?? []).map((m: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-start border-b border-dashed pb-2 break-inside-avoid"
                                >
                                    <div className="flex-1">
                                        {categoryLabel(m.type) && (
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">{categoryLabel(m.type)}</p>
                                        )}
                                        <p className="font-semibold">
                                            {i + 1}. {m.trade_name}
                                            <span className="text-gray-500 text-xs ml-1">({m.generic_name})</span>
                                        </p>
                                        <p className="text-xs text-gray-700">{m.dosage}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatStoredFrequency(m)}
                                        </p>
                                        <p className="text-xs text-gray-600">{formatStoredDuration(m)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-dashed my-4" />

                <div>
                    <h3 className="font-semibold text-emerald-600 mb-1">Advice</h3>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                        {(data.advice_list ?? []).map((a: string, i: number) => (
                            <li key={i} className="break-inside-avoid">{a}</li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4">
                    <FollowUpBlock value={followUp} baseDate={consultation.created_at} />
                </div>
            </div>
        </div>
    );
}
