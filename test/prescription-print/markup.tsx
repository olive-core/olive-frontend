import { renderToStaticMarkup } from "react-dom/server";

import PrescriptionPrintBody from "@/components/prescription/paper/prescription-print-body";
import { PrintFitContext, PRINT_FIT_LEVELS } from "@/components/prescription/paper/print-fit";

// A long single line of advice used to push the left column over the medicines and off
// the page. Rendering the real body is the only honest way to keep that fixed.
const LONG_ADVICE =
    "Drink plenty of water throughout the day and avoid oily food, especially reheated-cooking-oil-fried-street-food";

export function printBodyMarkup(level: number): string {
    const data = {
        chief_complaints: [
            // The shape the AI pipeline actually produces: a short label, with the substance
            // of the complaint in the note. Printing the label alone loses the complaint.
            { name_text: "Vomiting", duration: "", notes: "Persistent vomiting \u00d7 4 days following fall." },
            { name_text: "Fever for three days with a persistent unproductive cough", duration: "3 days" },
        ],
        histories:        [{ name_text: "Hypertension", notes: "On amlodipine 5mg for six years." }],
        diagnoses:        [{ name_text: "Acute upper respiratory tract infection" }],
        // An investigation's Clinical Notes field is stored as `reason`, so it prints like any
        // other note — and a test ordered without one must not gain a blank line.
        investigations: [
            { name_text: "CBC with ESR", reason: "To evaluate febrile illness.", priority: "routine" },
            { name_text: "Serum creatinine", reason: "", priority: "routine" },
        ],
        rx_list: [
            {
                trade_name: "Napa Extra", generic_name: "Paracetamol + Caffeine", type: "tablet",
                dosage: "1 tablet", instructions: "After meals",
            },
        ],
        advice_list: [LONG_ADVICE],
        follow_up_days: 7,
    };

    return renderToStaticMarkup(
        <PrintFitContext value={PRINT_FIT_LEVELS[level]}>
            <PrescriptionPrintBody data={data} />
        </PrintFitContext>,
    );
}
