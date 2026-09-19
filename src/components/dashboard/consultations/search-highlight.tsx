import { Fragment, type ReactNode } from "react";
import type { SearchTokens } from "./filters/search-consultations";

interface SearchHighlightProps {
    text:    string;
    tokens?: SearchTokens;
}

interface Range {
    start: number;
    end:   number;
}

// Marks the part of a row the search landed on, so a hit on a diagnosis or a number never
// looks like the list glitched. Deliberately dumb: a plain case-insensitive substring, so
// a separator-insensitive match ("napaextra" finding "Napa Extra") simply goes unmarked
// rather than marking the wrong span.
export default function SearchHighlight({ text, tokens = [] }: SearchHighlightProps) {
    const ranges = findRanges(text, tokens);
    if (ranges.length === 0) return <>{text}</>;

    const parts: ReactNode[] = [];
    let cursor = 0;
    ranges.forEach((range, index) => {
        if (range.start > cursor) {
            parts.push(<Fragment key={`plain-${index}`}>{text.slice(cursor, range.start)}</Fragment>);
        }
        parts.push(
            <mark key={`mark-${index}`} className="rounded-[3px] bg-amber-100 px-0.5 text-inherit">
                {text.slice(range.start, range.end)}
            </mark>,
        );
        cursor = range.end;
    });
    if (cursor < text.length) parts.push(<Fragment key="plain-tail">{text.slice(cursor)}</Fragment>);

    return <>{parts}</>;
}

function findRanges(text: string, tokens: SearchTokens): Range[] {
    const haystack = text.toLowerCase();
    const found: Range[] = [];

    for (const token of tokens) {
        // A single character mark is noise, not an explanation.
        if (token.norm.length < 2) continue;
        let from = haystack.indexOf(token.norm);
        while (from !== -1) {
            found.push({ start: from, end: from + token.norm.length });
            from = haystack.indexOf(token.norm, from + token.norm.length);
        }
    }

    return mergeRanges(found);
}

function mergeRanges(ranges: Range[]): Range[] {
    if (ranges.length === 0) return ranges;
    const sorted = [...ranges].sort((left, right) => left.start - right.start);
    const merged: Range[] = [sorted[0]];
    for (const range of sorted.slice(1)) {
        const last = merged[merged.length - 1];
        if (range.start <= last.end) last.end = Math.max(last.end, range.end);
        else merged.push(range);
    }
    return merged;
}
