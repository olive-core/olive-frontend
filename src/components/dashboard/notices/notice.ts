import type { ReactNode } from "react";

export type NoticeTone = "info" | "warning" | "danger";

export interface DashboardNotice {
    /** Stable key — also the dismissal key, so dismissing one never hides another. */
    id:      string;
    tone:    NoticeTone;
    message: ReactNode;
    action?: { label: string; to?: string; onClick?: () => void };
}

const DISMISS_PREFIX = "olive-notice-dismissed:";

function today(): string {
    return new Date().toDateString();
}

export function dismissNoticeForToday(id: string): void {
    localStorage.setItem(DISMISS_PREFIX + id, today());
}

export function isNoticeDismissedToday(id: string): boolean {
    return localStorage.getItem(DISMISS_PREFIX + id) === today();
}
