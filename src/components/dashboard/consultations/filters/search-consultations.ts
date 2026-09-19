import { toKey, toNorm } from "@/lib/search-core/normalize";
import { boundedLevenshtein } from "@/lib/search-core/distance";
import type { ClinicianConsultationItem } from "@/types/consultation";

// One box for the three things a doctor remembers about a visit: who it was, what it was,
// and the number on the slip. Every word typed has to land somewhere on the row, but each
// word is free to land on a different field, so "rahim fever" and "fever 5678" both work.
// Normalization is the shared one in src/lib/search-core, so "rhino-sinusitis",
// "rhinosinusitis" and "01712-345678" collapse the same way they do everywhere else.
// See src/lib/search-core/rank.ts for the reference implementation of the ladder.

/** Under this many digits a run of digits is not read as part of a number. */
const MIN_PHONE_DIGITS = 3;
/** A number is only matched mid-string once the query is this specific. Shorter queries
 *  must match the start or the end, so "5678" finds a number instead of all of them. */
const INTERIOR_PHONE_DIGITS = 7;
/** One and two letter words only match the start of a word, never the middle of one. */
const MIN_INTERIOR_LETTERS = 3;
/** Spelling tolerance, only ever used on the fallback pass. */
const FUZZY_MIN_LENGTH = 4;
const FUZZY_LONG_LENGTH = 6;

export interface SearchToken {
    /** Lowercased, punctuation collapsed to spaces: "rhino sinusitis". */
    norm:   string;
    /** The norm with separators removed: "rhinosinusitis". */
    key:    string;
    /** National phone digits, or "" when the word is not number shaped. */
    digits: string;
}

export type SearchTokens = SearchToken[];

interface IndexedText {
    norm: string;
    key:  string;
}

interface IndexedConsultation {
    record:   ClinicianConsultationItem;
    name:     IndexedText;
    clinical: IndexedText[];
    phones:   string[];
}

export type ConsultationIndex = IndexedConsultation[];

export interface ConsultationSearchResult {
    items: ClinicianConsultationItem[];
    /** True when nothing matched as typed and these rows come from the spelling pass. */
    isApproximate: boolean;
}

// "+8801712345678", "8801712345678", "01712-345678" and "1712345678" all collapse to
// "1712345678", so a number matches however it was stored and however it is typed.
export function toPhoneKey(value: string): string {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("880")) digits = digits.slice(3);
    if (digits.startsWith("0"))   digits = digits.slice(1);
    return digits;
}

// "+8801712345678" -> "01712345678", the local form a doctor would dial. Deliberately
// unseparated: it is also what the highlighter searches, so the digits the doctor typed
// are the digits that get marked.
export function formatPhone(value: string): string {
    const national = toPhoneKey(value);
    return national.length === 10 ? `0${national}` : value;
}

export function tokenizeQuery(searchTerm: string): SearchTokens {
    const trimmed = searchTerm.trim();
    if (!trimmed) return [];

    // A query that is nothing but a number is one token however it was spaced or
    // punctuated: "+880 1712 345678" is a single number, not three words.
    const whole = trimmed.replace(/[\s+()\-.]/g, "");
    if (/^\d+$/.test(whole) && whole.length >= MIN_PHONE_DIGITS) return [numberToken(whole)];

    const tokens: SearchTokens = [];
    for (const piece of trimmed.split(/\s+/)) {
        const rawDigits = piece.replace(/\D/g, "");
        if (rawDigits.length >= MIN_PHONE_DIGITS && !/[a-z]/i.test(piece)) {
            tokens.push(numberToken(rawDigits));
            continue;
        }
        const key = toKey(piece);
        if (key) tokens.push({ norm: toNorm(piece), key, digits: "" });
    }
    return tokens;
}

// A number's norm is its digits, not its punctuation, so "01712-345678" marks the same
// span as "01712345678". A complete number is shown in local form to match the card.
function numberToken(rawDigits: string): SearchToken {
    const digits = toPhoneKey(rawDigits);
    const shown = digits.length === 10 ? `0${digits}` : rawDigits;
    return { norm: shown, key: shown, digits };
}

export function buildConsultationIndex(items: ClinicianConsultationItem[]): ConsultationIndex {
    return items.map((record) => ({
        record,
        // The raw name, never the "Unknown patient" fallback: typing "unknown" should not
        // pull up every unnamed patient.
        name: indexText(record.patient_name ?? ""),
        clinical: [
            ...(record.diagnoses_summary ?? []),
            ...(record.chief_complaints_summary ?? []),
        ].map(indexText),
        phones: (record.patient_phones ?? []).map(toPhoneKey).filter(Boolean),
    }));
}

export function searchConsultations(index: ConsultationIndex, searchTerm: string): ConsultationSearchResult {
    const tokens = tokenizeQuery(searchTerm);
    if (tokens.length === 0) {
        return { items: index.map((row) => row.record), isApproximate: false };
    }

    const literal = index.filter((row) => tokens.every((token) => matchesToken(row, token, false)));
    if (literal.length > 0) return { items: literal.map((row) => row.record), isApproximate: false };

    // Nothing matched as typed. Bangla names romanize half a dozen ways, so rather than
    // an empty page, retry once with a small edit budget and say so in the result header.
    const approximate = index.filter((row) => tokens.every((token) => matchesToken(row, token, true)));
    return { items: approximate.map((row) => row.record), isApproximate: approximate.length > 0 };
}

/** Whether a single clinical string is why a row matched. Used to order the pills. */
export function textMatchesTokens(value: string, tokens: SearchTokens): boolean {
    if (tokens.length === 0) return false;
    const field = indexText(value);
    return tokens.some((token) => matchesText(field, token, "substring"));
}

/** The number a search matched on, so the card can show the one the doctor typed. */
export function matchedPhone(
    consultation: ClinicianConsultationItem,
    tokens: SearchTokens,
): string | null {
    for (const phone of consultation.patient_phones ?? []) {
        const key = toPhoneKey(phone);
        if (tokens.some((token) => matchesPhoneKey(key, token.digits))) return phone;
    }
    return null;
}

function indexText(value: string): IndexedText {
    return { norm: toNorm(value), key: toKey(value) };
}

function matchesToken(row: IndexedConsultation, token: SearchToken, fuzzy: boolean): boolean {
    // A number-shaped word is still tried as text afterwards, so "305" can find a ward
    // in a diagnosis as well as a phone number. There are no modes to get stuck in.
    if (token.digits && row.phones.some((phone) => matchesPhoneKey(phone, token.digits))) return true;
    if (matchesText(row.name, token, "word")) return true;
    if (row.clinical.some((field) => matchesText(field, token, "substring"))) return true;
    if (!fuzzy) return false;

    const budget = fuzzyBudget(token);
    return matchesFuzzy(row.name, token, budget)
        || row.clinical.some((field) => matchesFuzzy(field, token, budget));
}

type MatchWidth = "word" | "substring";

// The ladder, narrowed for a filter: exact, prefix of the value, start of a later word,
// then anywhere inside. A name stops before the last rung, because "ahi" matching every
// Rahim, Shahid and Fahim is the thing that makes a search feel random. A diagnosis needs
// that rung: "sinusitis" has to find "Acute rhinosinusitis".
function matchesText(field: IndexedText, token: SearchToken, width: MatchWidth): boolean {
    if (!field.key) return false;
    if (field.key === token.key) return true;
    if (field.key.startsWith(token.key)) return true;
    if (field.norm.includes(` ${token.norm}`)) return true;
    if (width === "word") return false;
    if (token.key.length < MIN_INTERIOR_LETTERS) return false;
    return field.key.includes(token.key);
}

export function matchesPhoneKey(phoneKey: string, digits: string): boolean {
    if (!digits || !phoneKey) return false;
    if (digits.length >= INTERIOR_PHONE_DIGITS) return phoneKey.includes(digits);
    return phoneKey.startsWith(digits) || phoneKey.endsWith(digits);
}

function fuzzyBudget(token: SearchToken): number {
    if (token.key.length >= FUZZY_LONG_LENGTH) return 2;
    if (token.key.length >= FUZZY_MIN_LENGTH)  return 1;
    return 0;
}

// Word by word: "raheem" is one edit from "rahim" but six from "rahim uddin chowdhury".
// Never applied to a number, where a wrong digit is a wrong patient, not a typo.
function matchesFuzzy(field: IndexedText, token: SearchToken, budget: number): boolean {
    if (budget === 0 || !field.norm) return false;
    return field.norm.split(" ").some((word) => boundedLevenshtein(word, token.key, budget) <= budget);
}
