import type { InsightFilters } from "./filters/insight-filters";

export type QuestionKey =
    | "who" | "complaints" | "diagnosis" | "returning" | "protocol" | "changing";

export const QUESTIONS: { key: QuestionKey; label: string }[] = [
    { key: "who",        label: "Who's coming" },
    { key: "complaints", label: "What they come with" },
    { key: "diagnosis",  label: "What it turns out to be" },
    { key: "returning",  label: "Do they come back" },
    { key: "protocol",   label: "What I prescribe" },
    { key: "changing",   label: "What's changing" },
];

/** Narrow the page to what was clicked, and move to the question that answers it. */
export type DrillDown = (patch: Partial<InsightFilters>, to: QuestionKey) => void;
