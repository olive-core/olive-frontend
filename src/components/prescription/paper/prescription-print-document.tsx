import type { ReactNode } from "react";

import type { ResolvedLetterhead } from "@/lib/header-config";
import { vitalsFromOnExaminations } from "@/lib/vitals";
import { formatStoredDuration, formatStoredFrequency } from "@/lib/rx-format";
import { categoryLabel } from "@/lib/dosage-form";
import { ResolvedPrescriptionHeader } from "../header/clinician-prescription-header";
import PrescriptionFooter from "../footer/prescription-footer";
import PrintSheet from "./print-sheet";
import VitalsBar from "./vitals-bar";
import FollowUpBlock from "./follow-up-block";

// The one printed prescription document, shared by the in-session draft and the saved
// consultation views so the two printouts can never drift apart. `data` is the
// prescription payload shape both already share (chief_complaints, rx_list, ...).

interface PrescriptionPrintDocumentProps {
    letterhead:        ResolvedLetterhead | null;
    data:              Record<string, any>;
    patientSlot:       ReactNode;
    followUpBaseDate?: string;
}

function EmptySectionNote({ children }: { children: ReactNode }) {
    return <p className="pl-1 text-xs italic text-gray-400">{children}</p>;
}

// Every heading always prints: the prescription is a standard form, and a reader finding the
// same landmarks each time is what makes a gap legible as a gap. `emptyText` reads as the
// clinician's own statement, because an empty section is their decision — each of these
// sections has an Add control they chose not to use. Nothing here should suggest the record
// failed to capture something.
function PrintSection({
    title,
    items,
    emptyText,
}: {
    title: string;
    items: { name_text?: string }[];
    emptyText: string;
}) {
    return (
        <div>
            <h3 className="font-semibold text-emerald-600">{title}</h3>
            {items.length === 0 ? (
                <EmptySectionNote>{emptyText}</EmptySectionNote>
            ) : (
                <ul className="list-disc pl-4 text-xs">
                    {items.map((item, index) => (
                        <li key={index}>{item.name_text}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function RxEntry({ medicine, index }: { medicine: any; index: number }) {
    const instructions = medicine.instructions?.trim();

    return (
        <div className="border-b border-dashed pb-2 break-inside-avoid">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    {categoryLabel(medicine.type) && (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                            {categoryLabel(medicine.type)}
                        </p>
                    )}
                    <p className="font-semibold">
                        {index + 1}. {medicine.trade_name}
                        <span className="text-gray-500 text-xs ml-1">({medicine.generic_name})</span>
                    </p>
                    <p className="text-xs text-gray-700">{medicine.dosage}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold">{formatStoredFrequency(medicine)}</p>
                    <p className="text-xs text-gray-600">{formatStoredDuration(medicine)}</p>
                </div>
            </div>
            {instructions && (
                <p className="mt-1.5 border-l-2 border-emerald-200 pl-2 text-xs italic text-gray-600">
                    {instructions}
                </p>
            )}
        </div>
    );
}

export default function PrescriptionPrintDocument({
    letterhead,
    data,
    patientSlot,
    followUpBaseDate,
}: PrescriptionPrintDocumentProps) {
    const vitals = vitalsFromOnExaminations(data.on_examinations);
    const followUp = { follow_up_days: data.follow_up_days ?? null, follow_up_notes: data.follow_up_notes ?? null };
    const medicines = data.rx_list ?? [];
    const adviceList = data.advice_list ?? [];

    return (
        <PrintSheet
            header={
                <>
                    {letterhead && <ResolvedPrescriptionHeader letterhead={letterhead} />}
                    {patientSlot}
                </>
            }
            footer={letterhead && <PrescriptionFooter footer={letterhead.footer} config={letterhead.config} />}
        >
            <VitalsBar vitals={vitals} />

            <div className="border-t border-dashed my-3" />

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                    <PrintSection title="Chief Complaints" items={data.chief_complaints ?? []} emptyText="None reported" />
                    <PrintSection title="History" items={data.histories ?? []} emptyText="None reported" />
                    <PrintSection title="Diagnosis" items={data.diagnoses ?? []} emptyText="None specified" />
                    <PrintSection
                        title="Investigation"
                        items={data.investigations ?? []}
                        emptyText="No investigation advised"
                    />
                </div>

                <div className="col-span-2">
                    <h3 className="font-semibold text-emerald-600 mb-2">Rx</h3>
                    {medicines.length === 0 ? (
                        <EmptySectionNote>No medicine prescribed</EmptySectionNote>
                    ) : (
                        <div className="space-y-2">
                            {medicines.map((medicine: any, index: number) => (
                                <RxEntry key={index} medicine={medicine} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-dashed my-4" />

            <div>
                <h3 className="font-semibold text-emerald-600 mb-1">Advice</h3>
                {adviceList.length === 0 ? (
                    <EmptySectionNote>No specific advice</EmptySectionNote>
                ) : (
                    <ul className="list-disc pl-5 text-xs space-y-1">
                        {adviceList.map((advice: string, index: number) => (
                            <li key={index} className="break-inside-avoid">
                                {advice}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-4">
                <FollowUpBlock value={followUp} baseDate={followUpBaseDate} />
            </div>
        </PrintSheet>
    );
}
