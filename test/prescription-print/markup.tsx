import { renderToStaticMarkup } from "react-dom/server";

import PrescriptionPrintBody from "@/components/prescription/paper/prescription-print-body";
import { PrintFitContext, PRINT_FIT_LEVELS } from "@/components/prescription/paper/print-fit";

// A long single line of advice used to push the left column over the medicines and off
// the page. Rendering the real body is the only honest way to keep that fixed.
const LONG_ADVICE =
    "Drink plenty of water throughout the day and avoid oily food, especially reheated-cooking-oil-fried-street-food";

export function printBodyMarkup(level: number): string {
    const data = {
        chief_complaints: [{ name_text: "Fever for three days with a persistent unproductive cough" }],
        histories:        [{ name_text: "Hypertension, on amlodipine for six years" }],
        diagnoses:        [{ name_text: "Acute upper respiratory tract infection" }],
        investigations:   [{ name_text: "CBC with ESR" }],
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
