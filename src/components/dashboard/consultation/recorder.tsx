import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";

import { useRecordingSession } from "@/hooks/use-recording-session";
import RecorderCard from "./recorder-card";
import { RecordingBusyElsewhereNotice, RecordingFinishedNotice } from "./recorder-notice";

// The consultation screen's slot for the shared recording session: it starts the
// recording on arrival, then claims ownership of the on-screen recorder so the floating
// widget stays out of the way while this page is open.
export default function Recorder() {
    const { userId, consultationId } = useParams({ from: "/doctor/consultation/$userId/$consultationId" });
    const { target, hasFinished, startRecording } = useRecordingSession();

    useEffect(() => {
        startRecording({ sessionId: consultationId, patientId: userId });
    }, [startRecording, consultationId, userId]);

    if (target && target.sessionId !== consultationId) return <RecordingBusyElsewhereNotice />;
    if (!target && hasFinished(consultationId)) return <RecordingFinishedNotice consultationId={consultationId} />;

    return <RecorderCard />;
}
