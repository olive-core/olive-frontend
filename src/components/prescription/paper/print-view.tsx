import type { ConsultationDetail } from "@/types/consultation";
import type { PatientInfoType } from "@/types/patient";
import type { ClinicianProfile } from "./read-view";
import ClinicianHeader from "./clinician-header";
import PatientStrip from "./patient-strip";

interface PrescriptionPrintViewProps {
    consultation: ConsultationDetail;
    clinician?:   ClinicianProfile;
    patient?:     PatientInfoType;
}

function getRoutineString(routine: any): string {
    if (routine?.gap_hour) return `Every ${routine.gap_hour} hours`;

    const morning = routine?.before_breakfast || routine?.after_breakfast ? 1 : 0;
    const noon    = routine?.before_lunch     || routine?.after_lunch     ? 1 : 0;
    const evening = routine?.before_dinner    || routine?.after_dinner    ? 1 : 0;

    return `${morning}+${noon}+${evening}`;
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
                                        <p className="font-semibold">
                                            {i + 1}. {m.trade_name}
                                            <span className="text-gray-500 text-xs ml-1">({m.generic_name})</span>
                                        </p>
                                        <p className="text-xs text-gray-700">{m.dosage}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-base tracking-wider font-semibold">
                                            {getRoutineString(m.routine)}
                                        </p>
                                        <p className="text-xs text-gray-600">{m.duration}</p>
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
            </div>
        </div>
    );
}
