import { isPrePrinted, type PrintPaper } from "@/lib/print-paper";

// The questions the first-run setup asks, in order. A pre-printed pad prints none of the
// doctor's details, so that question drops out of the flow the moment the paper is chosen —
// and the step count shrinks with it, which is how the doctor learns they are nearly done.
export type SetupStage = "place" | "paper" | "details";

const LETTERHEAD_STAGES: SetupStage[] = ["place", "paper", "details"];
const PRE_PRINTED_STAGES: SetupStage[] = ["place", "paper"];

export function setupStages(paper: PrintPaper | undefined): SetupStage[] {
    return paper && isPrePrinted(paper) ? PRE_PRINTED_STAGES : LETTERHEAD_STAGES;
}
