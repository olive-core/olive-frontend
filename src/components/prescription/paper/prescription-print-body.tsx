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

// Clinical text is unpredictable: a pasted lab reference, a hyphenated drug name, a URL.
// Anything that cannot wrap at a space wraps mid-word rather than running off the page.
const WRAPPING_TEXT = "break-words";

// A section entry as it prints: the name, the timeline the clinician typed beside it, and
// the clinical note under it. The note is where the substance of a complaint lives — the
// name is only its label, so "Vomiting" alone loses "Persistent vomiting × 4 days following
// fall." Which fields an item actually has is what decides what prints: chief complaints and
// histories carry `duration` and `notes`, investigations carry `reason`, and diagnoses are a
// bare name.
interface PrintSectionItem {
    name_text?: string;
    duration?:  string | null;
    notes?:     string | null;
    /** An investigation's note. The editor writes the same "Clinical Notes" field here,
     *  under a different name, because that is what the stored payload calls it. */
    reason?:    string | null;
}

function SectionEntry({ item, classes }: { item: PrintSectionItem; classes: PrintFitClasses }) {
    const duration = item.duration?.trim();
    // Never both: the stored payload gives complaints and histories `notes` and gives
    // investigations `reason`, and the editor feeds one Clinical Notes box into whichever
    // one this section uses.
    const note = (item.notes ?? item.reason)?.trim();

    return (
        // A complaint and the note explaining it are one thought; a page break between them
        // would leave the note stranded under the wrong heading.
        <li className="break-inside-avoid">
            {item.name_text}
            {duration && <span className="text-gray-700"> — {duration}</span>}
            {note && (
                <span className={cn("block italic text-gray-800", classes.detailText)}>{note}</span>
            )}
        </li>
    );
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
    items:     PrintSectionItem[];
    emptyText: string;
    classes:   PrintFitClasses;
}) {
    return (
        <div>
            <h3 className="font-semibold text-emerald-900">{title}</h3>
            {items.length === 0 ? (
                <EmptySectionNote>{emptyText}</EmptySectionNote>
            ) : (
                <ul className={cn("list-disc pl-4", WRAPPING_TEXT, classes.listText, classes.sectionItems)}>
                    {items.map((item, index) => (
                        <SectionEntry key={index} item={item} classes={classes} />
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
            <div className="flex justify-between items-start gap-2">
                <div className={cn("min-w-0 flex-1", WRAPPING_TEXT)}>
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
                <div className="shrink-0 text-right">
                    <p className={cn("font-semibold", classes.frequency)}>{formatStoredFrequency(medicine)}</p>
                    <p className={cn("text-gray-800", classes.medicineMeta)}>{formatStoredDuration(medicine)}</p>
                </div>
            </div>
            {instructions && (
                <p className={cn("mt-1.5 border-l-2 border-emerald-200 pl-2 italic text-gray-800", WRAPPING_TEXT, classes.medicineMeta)}>
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
                <ul className={cn("list-disc space-y-1 pl-5", WRAPPING_TEXT, classes.listText)}>
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

            {/* min-w-0 on both columns: a grid column will not shrink below its longest
                line on its own, and one long word would push the whole grid over the Rx
                column and off the page. */}
            <div className={cn("grid grid-cols-3", classes.columnGap)}>
                <div className={cn("min-w-0", classes.sectionStack)}>
                    <PrintSection title="Chief Complaints" items={data.chief_complaints ?? []} emptyText="None reported" classes={classes} />
                    <PrintSection title="History" items={data.histories ?? []} emptyText="None reported" classes={classes} />
                    <PrintSection title="Diagnosis" items={data.diagnoses ?? []} emptyText="None specified" classes={classes} />
                    {/* An investigation's note prints for the same reason a complaint's does: the
                        clinician typed it into a box labelled Clinical Notes, and "fasting sample"
                        or "bring previous reports" is worth more on the paper than the line it
                        costs. An AI-drafted one reads as the rationale for ordering the test
                        ("To rule out dengue fever"), which is redundant but never wrong — and
                        dropping every note to spare that redundancy is what lost the typed ones. */}
                    <PrintSection title="Investigation" items={data.investigations ?? []} emptyText="No investigation advised" classes={classes} />
                    {fit.adviceInSidebar && advice}
                </div>

                <div className="col-span-2 min-w-0">
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
