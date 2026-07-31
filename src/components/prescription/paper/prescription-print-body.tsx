import type { ReactNode } from "react";

import { categoryLabel } from "@/lib/dosage-form";
import { formatStoredDuration, formatStoredFrequency } from "@/lib/rx-format";
import { vitalsFromOnExaminations } from "@/lib/vitals";
import { cn } from "@/lib/utils";
import { printFitClasses, usePrintFit, type PrintFitClasses } from "./print-fit";
import VitalsBar from "./vitals-bar";
import FollowUpBlock from "./follow-up-block";

// Everything a printed prescription says, between the letterhead and the footer. It
// renders at whichever density PrintSheet has settled on, so a long medicine list stays
// on one page without the doctor changing anything.

interface PrescriptionPrintBodyProps {
    data:              Record<string, any>;
    followUpBaseDate?: string;
}

function EmptySectionNote({ children }: { children: ReactNode }) {
    return <p className="pl-1 text-xs italic text-gray-700">{children}</p>;
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
    classes,
}: {
    title:     string;
    items:     { name_text?: string }[];
    emptyText: string;
    classes:   PrintFitClasses;
}) {
    return (
        <div>
            <h3 className="font-semibold text-emerald-900">{title}</h3>
            {items.length === 0 ? (
                <EmptySectionNote>{emptyText}</EmptySectionNote>
            ) : (
                <ul className={cn("list-disc pl-4", classes.listText)}>
                    {items.map((item, index) => (
                        <li key={index}>{item.name_text}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function RxEntry({ medicine, index, classes, showCategory }: {
    medicine:     any;
    index:        number;
    classes:      PrintFitClasses;
    showCategory: boolean;
}) {
    const instructions = medicine.instructions?.trim();
    const category = categoryLabel(medicine.type);

    return (
        <div className={cn("border-b border-dashed break-inside-avoid", classes.rxEntryPadding)}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    {showCategory && category && (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                            {category}
                        </p>
                    )}
                    <p className={cn("font-semibold", classes.medicineName)}>
                        {index + 1}. {medicine.trade_name}
                        <span className={cn("ml-1 text-gray-700", classes.medicineMeta)}>({medicine.generic_name})</span>
                    </p>
                    <p className={cn("text-gray-900", classes.medicineMeta)}>{medicine.dosage}</p>
                </div>
                <div className="text-right">
                    <p className={cn("font-semibold", classes.frequency)}>{formatStoredFrequency(medicine)}</p>
                    <p className={cn("text-gray-800", classes.medicineMeta)}>{formatStoredDuration(medicine)}</p>
                </div>
            </div>
            {instructions && (
                <p className={cn("mt-1.5 border-l-2 border-emerald-200 pl-2 italic text-gray-800", classes.medicineMeta)}>
                    {instructions}
                </p>
            )}
        </div>
    );
}

function AdviceSection({ items, classes }: { items: string[]; classes: PrintFitClasses }) {
    return (
        <div>
            <h3 className="mb-1 font-semibold text-emerald-900">Advice</h3>
            {items.length === 0 ? (
                <EmptySectionNote>No specific advice</EmptySectionNote>
            ) : (
                <ul className={cn("list-disc space-y-1 pl-5", classes.listText)}>
                    {items.map((advice, index) => (
                        <li key={index} className="break-inside-avoid">
                            {advice}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function PrescriptionPrintBody({ data, followUpBaseDate }: PrescriptionPrintBodyProps) {
    const fit = usePrintFit();
    const classes = printFitClasses(fit);

    const vitals = vitalsFromOnExaminations(data.on_examinations);
    const followUp = { follow_up_days: data.follow_up_days ?? null, follow_up_notes: data.follow_up_notes ?? null };
    const medicines = data.rx_list ?? [];
    const adviceList: string[] = data.advice_list ?? [];
    const advice = <AdviceSection items={adviceList} classes={classes} />;

    return (
        <>
            <VitalsBar vitals={vitals} />

            <div className={cn("border-t border-dashed", classes.divider)} />

            <div className={cn("grid grid-cols-3", classes.columnGap)}>
                <div className={classes.sectionStack}>
                    <PrintSection title="Chief Complaints" items={data.chief_complaints ?? []} emptyText="None reported" classes={classes} />
                    <PrintSection title="History" items={data.histories ?? []} emptyText="None reported" classes={classes} />
                    <PrintSection title="Diagnosis" items={data.diagnoses ?? []} emptyText="None specified" classes={classes} />
                    <PrintSection title="Investigation" items={data.investigations ?? []} emptyText="No investigation advised" classes={classes} />
                    {fit.adviceInSidebar && advice}
                </div>

                <div className="col-span-2">
                    <h3 className="mb-2 font-semibold text-emerald-900">Rx</h3>
                    {medicines.length === 0 ? (
                        <EmptySectionNote>No medicine prescribed</EmptySectionNote>
                    ) : (
                        <div className={classes.rxStack}>
                            {medicines.map((medicine: any, index: number) => (
                                <RxEntry
                                    key={index}
                                    medicine={medicine}
                                    index={index}
                                    classes={classes}
                                    showCategory={!fit.denseType}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!fit.adviceInSidebar && (
                <>
                    <div className={cn("border-t border-dashed", classes.adviceDivider)} />
                    {advice}
                </>
            )}

            <div className={classes.followUpTop}>
                <FollowUpBlock value={followUp} baseDate={followUpBaseDate} />
            </div>
        </>
    );
}
