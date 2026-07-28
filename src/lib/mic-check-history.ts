import type { MicVerdict } from "./mic-check";

const STORAGE_KEY = "olive-mic-check";

export interface MicCheckRecord {
    verdict:    MicVerdict;
    inputLabel: string;
    /** Local date string, so a check counts for the day it was taken. */
    checkedOn:  string;
}

function today(): string {
    return new Date().toDateString();
}

export function rememberMicCheck(verdict: MicVerdict, inputLabel: string): void {
    const record: MicCheckRecord = { verdict, inputLabel, checkedOn: today() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function lastMicCheck(): MicCheckRecord | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as MicCheckRecord) : null;
    } catch {
        return null;
    }
}

export function checkedToday(): boolean {
    return lastMicCheck()?.checkedOn === today();
}
