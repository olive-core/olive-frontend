import { Link } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { dismissNoticeForToday, type DashboardNotice, type NoticeTone } from "./notice";

const TONE_CLASS: Record<NoticeTone, string> = {
    info:    "border-slate-200 bg-slate-50 text-slate-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger:  "border-rose-200 bg-rose-50 text-rose-900",
};

export default function NoticeBar({ notice, onDismiss }: { notice: DashboardNotice; onDismiss: () => void }) {
    const dismiss = () => {
        dismissNoticeForToday(notice.id);
        onDismiss();
    };

    return (
        <div className={`flex items-center gap-3 border-b px-4 py-2.5 text-sm ${TONE_CLASS[notice.tone]} print:hidden`}>
            <p className="flex-1">{notice.message}</p>

            {notice.action?.to && (
                <Link to={notice.action.to} className="shrink-0 font-semibold underline-offset-2 hover:underline">
                    {notice.action.label}
                </Link>
            )}
            {notice.action && !notice.action.to && (
                <button
                    type="button"
                    onClick={notice.action.onClick}
                    className="shrink-0 font-semibold underline-offset-2 hover:underline"
                >
                    {notice.action.label}
                </button>
            )}

            <button type="button" aria-label="Dismiss" onClick={dismiss} className="shrink-0 opacity-60 hover:opacity-100">
                <XIcon className="size-4" />
            </button>
        </div>
    );
}
