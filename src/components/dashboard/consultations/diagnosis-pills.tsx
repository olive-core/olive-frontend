import SearchHighlight from "./search-highlight";
import { textMatchesTokens, type SearchTokens } from "./filters/search-consultations";

const MAX_VISIBLE_DIAGNOSES = 2;

interface Pill {
    text: string;
    kind: "diagnosis" | "complaint";
}

interface DiagnosisPillsProps {
    diagnoses: string[];
    /** Complaints, offered only so a search can explain itself on a row with no diagnosis. */
    complaints?: string[];
    /** Active search words: matches are pulled to the front and marked. */
    tokens?:     SearchTokens;
}

export default function DiagnosisPills({ diagnoses, complaints = [], tokens = [] }: DiagnosisPillsProps) {

    const pills = orderPills(diagnoses, complaints, tokens);

    if (pills.length === 0) {
        return (
            <span className="text-xs text-slate-400 italic">
                No diagnosis recorded
            </span>
        );
    }

    const visible = pills.slice(0, MAX_VISIBLE_DIAGNOSES);
    const overflow = pills.length - visible.length;

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {visible.map((pill, index) => (
                <span
                    key={index}
                    className={
                        pill.kind === "diagnosis"
                            ? "inline-block max-w-[160px] truncate px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
                            : "inline-block max-w-[160px] truncate px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                    }
                    title={pill.kind === "diagnosis" ? pill.text : `Complaint: ${pill.text}`}
                >
                    <SearchHighlight text={pill.text} tokens={tokens} />
                </span>
            ))}
            {overflow > 0 && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                    +{overflow}
                </span>
            )}
        </div>
    );
}

// Matching diagnoses come first, so the pill that explains the row is one of the two that
// fit. A complaint only earns a pill when no diagnosis matched, which is the case that
// would otherwise read as "No diagnosis recorded" next to an unexplained hit.
function orderPills(diagnoses: string[], complaints: string[], tokens: SearchTokens): Pill[] {
    const asDiagnosis = (text: string): Pill => ({ text, kind: "diagnosis" });

    if (tokens.length === 0) return diagnoses.map(asDiagnosis);

    const matchedDiagnoses = diagnoses.filter((text) => textMatchesTokens(text, tokens));
    const restDiagnoses = diagnoses.filter((text) => !textMatchesTokens(text, tokens));
    const explaining = matchedDiagnoses.length > 0
        ? []
        : complaints.filter((text) => textMatchesTokens(text, tokens));

    return [
        ...explaining.map((text): Pill => ({ text, kind: "complaint" })),
        ...matchedDiagnoses.map(asDiagnosis),
        ...restDiagnoses.map(asDiagnosis),
    ];
}
