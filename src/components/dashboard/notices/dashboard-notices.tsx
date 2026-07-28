import { useState } from "react";

import { isNoticeDismissedToday } from "./notice";
import NoticeBar from "./notice-bar";
import { useMicNotice } from "./use-mic-notice";
import { useSubscriptionNotice } from "./use-subscription-notice";

// The dashboard's one notice slot. Sources are listed most urgent first and at most one
// ever renders, so adding a feature can never add another bar above the queue. A mic that
// cannot hear outranks a trial nudge: the next consultation is lost either way, but only
// one of them is lost silently.
export default function DashboardNotices() {
    const [dismissed, setDismissed] = useState<string[]>([]);

    const notices = [useMicNotice(), useSubscriptionNotice()];
    const active = notices.find(
        (notice) => notice && !dismissed.includes(notice.id) && !isNoticeDismissedToday(notice.id),
    );

    if (!active) return null;

    return <NoticeBar notice={active} onDismiss={() => setDismissed((ids) => [...ids, active.id])} />;
}
